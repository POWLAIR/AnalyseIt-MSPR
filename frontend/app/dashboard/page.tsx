'use client';

import { useState, useEffect } from 'react';
import { apiClient, Pandemic } from '../lib/api';
import FilterPanel from '../components/FilterPanel';
import ChartContainer from '../components/ChartContainer';
import Card from '../components/Card';

interface FilterParams {
  country?: string;
  pandemicType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function Dashboard() {
  const [pandemics, setPandemics] = useState<Pandemic[]>([]);
  const [stats, setStats] = useState<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<'loading' | 'available' | 'unavailable' | 'filtered'>('loading');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pandemicsData, statsData] = await Promise.all([
        apiClient.getPandemics(),
        apiClient.getPandemicStats(),
      ]);
      
      if (pandemicsData && pandemicsData.length > 0) {
        setPandemics(pandemicsData);
        setDataStatus('available');
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
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters: FilterParams) => {
    try {
      setLoading(true);
      const filteredData = await apiClient.getFilteredPandemics({
        country: filters.country,
        type: filters.pandemicType,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      });
      
      if (filteredData && filteredData.length > 0) {
        setPandemics(filteredData);
        setDataStatus('filtered');
      } else {
        setPandemics([]);
        setDataStatus('unavailable');
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      setError('Erreur lors du filtrage des données. Veuillez réessayer plus tard.');
      setDataStatus('unavailable');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord interactif</h1>

      {error && (
        <div className="p-4 mb-6 text-sm rounded-lg bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Key Indicators */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Indicateurs clés</h2>
        
        {!stats ? (
          <div className="p-4 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              Aucune statistique disponible. Veuillez initialiser la base de données.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              title="Pandémies totales"
              value={stats.totalPandemics}
              description="Nombre total de pandémies enregistrées"
            />
            <Card
              title="Pandémies actives"
              value={stats.activePandemics}
              description="Pandémies en cours actuellement"
            />
            <Card
              title="Taux de transmission moyen"
              value={`${stats.averageTransmissionRate.toFixed(2)}%`}
              description="Moyenne du taux de transmission"
            />
            <Card
              title="Taux de mortalité moyen"
              value={`${stats.averageMortalityRate.toFixed(2)}%`}
              description="Moyenne du taux de mortalité"
            />
          </div>
        )}
      </div>

      {/* Filters and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
        <div className="lg:col-span-3 space-y-8">
          {dataStatus === 'unavailable' ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Aucune donnée disponible
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Veuillez initialiser la base de données et charger les données depuis la page d'accueil.
              </p>
            </div>
          ) : (
            <>
              {/* Transmission Rate Chart */}
              <ChartContainer
                type="line"
                title="Taux de transmission par pandémie"
                data={{
                  labels: pandemics.map((p) => p.name),
                  datasets: [
                    {
                      label: 'Taux de transmission (%)',
                      data: pandemics.map((p) => p.transmissionRate),
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1,
                    },
                  ],
                }}
              />

              {/* Mortality Rate Chart */}
              <ChartContainer
                type="bar"
                title="Taux de mortalité par pandémie"
                data={{
                  labels: pandemics.map((p) => p.name),
                  datasets: [
                    {
                      label: 'Taux de mortalité (%)',
                      data: pandemics.map((p) => p.mortalityRate),
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                  ],
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 