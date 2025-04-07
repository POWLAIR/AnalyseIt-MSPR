'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient, Pandemic, PandemicData } from '../lib/api';
import FilterPanel from '../components/FilterPanel';
import ChartContainer from '../components/ChartContainer';
import Card from '../components/Card';

interface FilterParams {
  country?: string;
  pandemicType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  active?: boolean;
}

interface GeographicData {
  country: string;
  count: number;
  totalCases: number;
  averageMortality: number;
}

export default function Dashboard() {
  const [pandemics, setPandemics] = useState<Pandemic[]>([]);
  const [pandemicData, setPandemicData] = useState<{[id: string]: PandemicData[]}>({});
  const [selectedPandemic, setSelectedPandemic] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<'loading' | 'available' | 'unavailable' | 'filtered'>('loading');
  const [filters, setFilters] = useState<FilterParams>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [pandemicTypes, setPandemicTypes] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    loadFilterOptions();
    
    // Configurer l'intervalle de rafraîchissement automatique (30 secondes)
    const interval = window.setInterval(() => {
      if (!filters.country && !filters.pandemicType && !filters.startDate && !filters.endDate) {
        loadData(false); // Rafraîchissement silencieux (sans indicateur de chargement)
      }
      // Rafraîchir les options de filtrage toutes les 5 minutes
      loadFilterOptions(false);
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadFilterOptions = async (showLoading = true, retryCount = 0) => {
    if (showLoading) {
      setLoading(prev => prev || true);
    }
    
    try {
      const options = await apiClient.getFilterOptions();
      if (options) {
        setCountries(options.countries);
        setPandemicTypes(options.types);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      // Ne pas afficher d'erreur pour les options de filtrage, utiliser les valeurs par défaut
      if (showLoading && retryCount === 0) {
        // Tentative silencieuse de rechargement après 2 secondes
        setTimeout(() => {
          loadFilterOptions(false, retryCount + 1);
        }, 2000);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const [pandemicsData, statsData] = await Promise.all([
        apiClient.getPandemics(),
        apiClient.getPandemicStats(),
      ]);
      
      if (pandemicsData && pandemicsData.length > 0) {
        setPandemics(pandemicsData);
        setDataStatus('available');
        
        // Sélectionner la première pandémie par défaut
        if (!selectedPandemic && pandemicsData.length > 0) {
          setSelectedPandemic(pandemicsData[0].id);
          loadPandemicData(pandemicsData[0].id);
        }
      } else {
        setPandemics([]);
        setDataStatus('unavailable');
      }
      
      if (statsData) {
        setStats(statsData);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
      setDataStatus('unavailable');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadPandemicData = async (pandemicId: string) => {
    try {
      const data = await apiClient.getPandemicData(pandemicId);
      if (data && data.length > 0) {
        setPandemicData(prev => ({
          ...prev,
          [pandemicId]: data
        }));
      }
    } catch (error) {
      console.error(`Error loading data for pandemic ${pandemicId}:`, error);
    }
  };

  const handleFilterChange = async (newFilters: FilterParams) => {
    // Mettre à jour l'état des filtres immédiatement
    setFilters(newFilters);
    setLoading(true);
    setError(null);
    
    try {
      const filteredData = await apiClient.getFilteredPandemics({
        country: newFilters.country,
        type: newFilters.pandemicType,
        startDate: newFilters.startDate?.toISOString(),
        endDate: newFilters.endDate?.toISOString(),
        active: newFilters.active
      });
      
      if (filteredData && filteredData.length > 0) {
        setPandemics(filteredData);
        setDataStatus('filtered');
        
        // Sélectionner la première pandémie filtrée
        setSelectedPandemic(filteredData[0].id);
        loadPandemicData(filteredData[0].id);
      } else {
        setPandemics([]);
        setDataStatus('unavailable');
        setError("Aucune pandémie ne correspond aux critères de filtrage sélectionnés.");
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      setError('Erreur lors du filtrage des données. Veuillez réessayer plus tard.');
      setDataStatus('unavailable');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({});
    loadData();
  };

  const handlePandemicSelect = (pandemicId: string) => {
    setSelectedPandemic(pandemicId);
    if (!pandemicData[pandemicId]) {
      loadPandemicData(pandemicId);
    }
  };

  // Données pour les visualisations
  const geographicData = useMemo(() => {
    if (!pandemics.length) return [];
    
    const countryMap = new Map<string, GeographicData>();
    
    pandemics.forEach(p => {
      if (!countryMap.has(p.country)) {
        countryMap.set(p.country, { 
          country: p.country, 
          count: 0, 
          totalCases: 0, 
          averageMortality: 0 
        });
      }
      
      const current = countryMap.get(p.country)!;
      current.count += 1;
      current.totalCases += p.totalCases;
      current.averageMortality = (current.averageMortality * (current.count - 1) + p.mortalityRate) / current.count;
      
      countryMap.set(p.country, current);
    });
    
    return Array.from(countryMap.values());
  }, [pandemics]);

  const typeDistribution = useMemo(() => {
    if (!pandemics.length) return { labels: [], data: [] };
    
    const typeMap = new Map<string, number>();
    
    pandemics.forEach(p => {
      typeMap.set(p.type, (typeMap.get(p.type) || 0) + 1);
    });
    
    return {
      labels: Array.from(typeMap.keys()),
      data: Array.from(typeMap.values()),
    };
  }, [pandemics]);

  const selectedPandemicDetails = useMemo(() => {
    if (!selectedPandemic) return null;
    return pandemics.find(p => p.id === selectedPandemic) || null;
  }, [selectedPandemic, pandemics]);

  const selectedPandemicTimeData = useMemo(() => {
    if (!selectedPandemic || !pandemicData[selectedPandemic]) return null;
    
    const data = pandemicData[selectedPandemic];
    return {
      labels: data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString();
      }),
      cases: data.map(d => d.cases),
      deaths: data.map(d => d.deaths),
      recoveries: data.map(d => d.recoveries),
    };
  }, [selectedPandemic, pandemicData]);

  if (loading && dataStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="text-xl font-semibold mb-2">Chargement des données...</div>
          <div className="text-gray-600">Veuillez patienter pendant que nous récupérons les informations.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Tableau de bord interactif</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Données {dataStatus === 'filtered' ? 'filtrées' : 'complètes'}</span>
          <button 
            onClick={() => loadData()} 
            className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1 p-2 rounded hover:bg-gray-100"
            title="Rafraîchir les données"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
            </svg>
            <span>Rafraîchir</span>
          </button>
          <a
            href="/dashboard/detailed-analysis"
            className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1 p-2 rounded hover:bg-gray-100"
            title="Voir l'analyse détaillée"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>Analyse détaillée</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm rounded-lg bg-red-50 text-red-800">
          {error}
        </div>
      )}

      {/* Key Indicators */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Indicateurs clés</h2>
        
        {!stats ? (
          <div className="p-4 text-center">
            <p className="text-gray-700">
              Aucune statistique disponible. Veuillez initialiser la base de données.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              title="Pandémies totales"
              value={stats.totalPandemics}
              description="Nombre total de pandémies enregistrées"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
              }
            />
            <Card
              title="Pandémies actives"
              value={stats.activePandemics}
              description="Pandémies en cours actuellement"
              trend={stats.activePandemics > 0 ? { value: 100 * stats.activePandemics / stats.totalPandemics, isPositive: false } : undefined}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="5"></circle>
                  <path d="m17.7 7.7 2.3-2.3"></path>
                  <path d="M22 6.5 6.5 22"></path>
                  <path d="m16 16-2-2"></path>
                  <path d="M7 7 5 5"></path>
                  <path d="M16 6a5 5 0 0 1-11 0"></path>
                </svg>
              }
            />
            <Card
              title="Taux de transmission"
              value={`${stats.averageTransmissionRate.toFixed(1)}%`}
              description="Moyenne du taux de transmission"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              }
            />
            <Card
              title="Taux de mortalité"
              value={`${stats.averageMortalityRate.toFixed(1)}%`}
              description="Moyenne du taux de mortalité"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m15 9-6 6"></path>
                  <path d="m9 9 6 6"></path>
                </svg>
              }
            />
          </div>
        )}
      </div>

      {/* Filters and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel 
            onFilterChange={handleFilterChange} 
            countries={countries}
            pandemicTypes={pandemicTypes}
            currentFilters={filters}
            onReset={resetFilters}
          />
          
          {/* Liste des pandémies */}
          {pandemics.length > 0 && (
            <div className="glass-card p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Pandémies ({pandemics.length})</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {pandemics.map(pandemic => (
                  <button
                    key={pandemic.id}
                    onClick={() => handlePandemicSelect(pandemic.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedPandemic === pandemic.id 
                        ? 'bg-primary-50 border-l-4 border-l-primary-500' 
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm">{pandemic.name}</div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{pandemic.country}</span>
                      <span>{pandemic.active ? 'Active' : 'Terminée'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 space-y-8">
          {dataStatus === 'unavailable' ? (
            <div className="glass-card p-6 text-center">
              <p className="text-lg text-gray-600 mb-2">
                Aucune donnée disponible
              </p>
              <p className="text-sm text-gray-500">
                Veuillez initialiser la base de données et charger les données depuis la page d'accueil.
              </p>
            </div>
          ) : (
            <>
              {/* Détails de la pandémie sélectionnée */}
              {selectedPandemicDetails && (
                <div className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{selectedPandemicDetails.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPandemicDetails.active 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPandemicDetails.active ? 'En cours' : 'Terminée'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="stat-card">
                      <div className="stat-title">Pays</div>
                      <div className="stat-value">{selectedPandemicDetails.country}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Type</div>
                      <div className="stat-value">{selectedPandemicDetails.type}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Cas totaux</div>
                      <div className="stat-value">{selectedPandemicDetails.totalCases ? selectedPandemicDetails.totalCases.toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Décès totaux</div>
                      <div className="stat-value">{selectedPandemicDetails.totalDeaths ? selectedPandemicDetails.totalDeaths.toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedPandemicDetails.description || "Aucune description disponible pour cette pandémie."}
                    </p>
                  </div>
                  
                  {/* Évolution temporelle */}
                  {selectedPandemicTimeData ? (
                    <div className="mt-6">
                      <h4 className="font-medium text-sm mb-4">Évolution temporelle</h4>
                      <ChartContainer
                        type="line"
                        title={`Évolution de ${selectedPandemicDetails.name}`}
                        data={{
                          labels: selectedPandemicTimeData.labels,
                          datasets: [
                            {
                              label: 'Cas',
                              data: selectedPandemicTimeData.cases,
                              borderColor: 'rgb(59, 130, 246)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.2,
                            },
                            {
                              label: 'Décès',
                              data: selectedPandemicTimeData.deaths,
                              borderColor: 'rgb(239, 68, 68)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              tension: 0.2,
                            },
                            {
                              label: 'Guérisons',
                              data: selectedPandemicTimeData.recoveries,
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              tension: 0.2,
                            }
                          ],
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-8 text-gray-500">
                      Chargement des données temporelles...
                    </div>
                  )}
                </div>
              )}

              {/* Visualisations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer
                  type="bar"
                  title="Taux de transmission par pandémie"
                  data={{
                    labels: pandemics.slice(0, 8).map((p) => p.name),
                    datasets: [
                      {
                        label: 'Taux de transmission (%)',
                        data: pandemics.slice(0, 8).map((p) => p.transmissionRate),
                        backgroundColor: 'rgba(45, 212, 191, 0.7)',
                      },
                    ],
                  }}
                />

                <ChartContainer
                  type="bar"
                  title="Taux de mortalité par pandémie"
                  data={{
                    labels: pandemics.slice(0, 8).map((p) => p.name),
                    datasets: [
                      {
                        label: 'Taux de mortalité (%)',
                        data: pandemics.slice(0, 8).map((p) => p.mortalityRate),
                        backgroundColor: 'rgba(251, 113, 133, 0.7)',
                      },
                    ],
                  }}
                />
                
                {/* Distribution par type */}
                <ChartContainer
                  type="pie"
                  title="Distribution par type"
                  data={{
                    labels: typeDistribution.labels,
                    datasets: [
                      {
                        data: typeDistribution.data,
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(45, 212, 191, 0.7)',
                          'rgba(168, 85, 247, 0.7)',
                          'rgba(251, 113, 133, 0.7)',
                        ],
                      },
                    ],
                  }}
                />
                
                {/* Distribution géographique */}
                <ChartContainer
                  type="bar"
                  title="Distribution géographique"
                  data={{
                    labels: geographicData.map(d => d.country),
                    datasets: [
                      {
                        label: 'Nombre de pandémies',
                        data: geographicData.map(d => d.count),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      },
                    ],
                  }}
                />
              </div>
              
              {/* Tableau comparatif */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Analyse comparative</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cas totaux</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux de mortalité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pandemics.slice(0, 10).map(pandemic => (
                        <tr 
                          key={pandemic.id}
                          className={`hover:bg-gray-50 cursor-pointer ${selectedPandemic === pandemic.id ? 'bg-primary-50' : ''}`}
                          onClick={() => handlePandemicSelect(pandemic.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{pandemic.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pandemic.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pandemic.country}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pandemic.totalCases ? pandemic.totalCases.toLocaleString() : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pandemic.mortalityRate !== undefined ? pandemic.mortalityRate.toFixed(1) : 'N/A'}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pandemic.active 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {pandemic.active ? 'Active' : 'Terminée'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 