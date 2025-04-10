'use client';

import { useState, useEffect } from 'react';
import { apiClient, DashboardStats, Pandemic, DailyStats, Localisation, DataSource, FilterParams } from '../lib/api';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import LineChart from '../components/charts/LineChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import BarChart from '../components/charts/BarChart';
import { format } from 'date-fns';

interface Filters {
  search: string;
  type: string;
  country: string;
  startDate: string;
  endDate: string;
  sortBy: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [epidemics, setEpidemics] = useState<Pandemic[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [locations, setLocations] = useState<Localisation[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    country: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'name'
  });
  const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({
    overview: false,
    epidemics: false,
    dailyStats: false,
    locations: false,
    sources: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData(1);
  }, [filters, activeTab]);

  const fetchData = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Préparer les paramètres de filtrage pour les appels API
      const filterParams: FilterParams = {
        country: filters.country !== 'all' ? filters.country : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      // Récupérer les données filtrées avec des indicateurs de chargement par section
      setLoadingForSection('overview', true);
      const statsData = await apiClient.getDashboardStats();
      setStats(statsData);
      setLoadingForSection('overview', false);

      setLoadingForSection('epidemics', true);
      const epidemicsData = await apiClient.getPandemics(page, pageSize, {
        search: filters.search,
        type: filters.type !== 'all' ? filters.type : undefined,
        country: filters.country !== 'all' ? filters.country : undefined,
        sortBy: filters.sortBy,
        sortDesc: false
      });
      setEpidemics(epidemicsData.items);
      setTotalPages(epidemicsData.pages);
      setCurrentPage(epidemicsData.page);
      setLoadingForSection('epidemics', false);

      if (activeTab === 'daily-stats') {
        setLoadingForSection('dailyStats', true);
        const dailyStatsData = await apiClient.getDailyStats();
        setDailyStats(dailyStatsData);
        setLoadingForSection('dailyStats', false);
      }

      if (activeTab === 'locations') {
        setLoadingForSection('locations', true);
        const locationsData = await apiClient.getLocations();
        setLocations(locationsData);
        setLoadingForSection('locations', false);
      }

      if (activeTab === 'sources') {
        setLoadingForSection('sources', true);
        const dataSourcesData = await apiClient.getDataSources();
        setDataSources(dataSourcesData);
        setLoadingForSection('sources', false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données. Veuillez réessayer plus tard."
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour l'état de chargement d'une section
  const setLoadingForSection = (section: string, isLoading: boolean) => {
    setSectionLoading(prev => ({ ...prev, [section]: isLoading }));
  };

  // Fonction pour filtrer les données quotidiennes
  const getFilteredDailyStats = () => {
    if (!filters.search && !filters.country && !filters.type && !filters.startDate) {
      return dailyStats;
    }

    return dailyStats.filter(stat => {
      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          stat.epidemic.name.toLowerCase().includes(searchLower) ||
          stat.location.country.toLowerCase().includes(searchLower) ||
          stat.epidemic.type.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtre par pays
      if (filters.country && filters.country !== 'all') {
        if (stat.location.country !== filters.country) return false;
      }

      // Filtre par type
      if (filters.type && filters.type !== 'all') {
        if (stat.epidemic.type !== filters.type) return false;
      }

      // Filtre par date
      if (filters.startDate) {
        const statDate = new Date(stat.date);
        const today = new Date();
        const daysAgo = parseInt(filters.startDate);
        const cutoffDate = new Date(today.setDate(today.getDate() - daysAgo));

        if (statDate < cutoffDate) return false;
      }

      return true;
    });
  };

  // Fonction pour filtrer les localisations
  const getFilteredLocations = () => {
    if (!filters.search && !filters.country) {
      return locations;
    }

    return locations.filter(location => {
      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          location.country.toLowerCase().includes(searchLower) ||
          (location.region && location.region.toLowerCase().includes(searchLower)) ||
          (location.iso_code && location.iso_code.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Filtre par pays
      if (filters.country && filters.country !== 'all') {
        if (location.country !== filters.country) return false;
      }

      return true;
    });
  };

  // Fonction pour filtrer les sources de données
  const getFilteredDataSources = () => {
    if (!filters.search && !filters.type) {
      return dataSources;
    }

    return dataSources.filter(source => {
      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          source.source_type.toLowerCase().includes(searchLower) ||
          (source.reference && source.reference.toLowerCase().includes(searchLower)) ||
          source.url.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtre par type
      if (filters.type && filters.type !== 'all') {
        if (source.source_type !== filters.type) return false;
      }

      return true;
    });
  };

  // Fonction pour changer de page
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage);
  };

  // Composant de pagination
  const Pagination = () => {
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-blue-500 text-white disabled:bg-gray-300"
        >
          Précédent
        </button>
        <span className="text-sm">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-blue-500 text-white disabled:bg-gray-300"
        >
          Suivant
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchData(1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Extraire les types et pays uniques pour les filtres
  const types = ['all', ...new Set(stats.type_distribution.map(d => d.type))];
  const countries = ['all', ...new Set(stats.geographic_distribution.map(d => d.country))];

  // Filter handlers
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Chart data preparation
  const prepareEvolutionData = () => {
    if (!stats) return {
      labels: [format(new Date(), 'dd/MM/yyyy')],
      datasets: [
        {
          label: 'Nouveaux cas',
          data: [0],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Nouveaux décès',
          data: [0],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Cas actifs',
          data: [0],
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1
        }
      ]
    };

    return {
      labels: stats.daily_evolution.map(d => format(new Date(d.date), 'dd/MM/yyyy')),
      datasets: [
        {
          label: 'Nouveaux cas',
          data: stats.daily_evolution.map(d => d.new_cases),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Nouveaux décès',
          data: stats.daily_evolution.map(d => d.new_deaths),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Cas actifs',
          data: stats.daily_evolution.map(d => d.active_cases),
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1
        }
      ]
    };
  };

  const prepareTypeDistributionData = () => {
    if (!stats) return {
      labels: ['Aucune donnée'],
      datasets: [{
        label: 'Distribution par type',
        data: [0],
        backgroundColor: ['rgb(255, 99, 132)']
      }]
    };

    return {
      labels: stats.type_distribution.map(d => d.type),
      datasets: [{
        label: 'Distribution par type',
        data: stats.type_distribution.map(d => d.cases),
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ]
      }]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto p-8 space-y-8">
        {/* En-tête et filtres */}
        <div className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Exploration des Données Épidémiques</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <Input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value: string) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {types.filter(type => type !== 'all').map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <Select
                value={filters.country}
                onValueChange={(value: string) => handleFilterChange('country', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {countries.filter(country => country !== 'all').map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <Select
                value={filters.startDate}
                onValueChange={(value: string) => handleFilterChange('startDate', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Date de début" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute la période</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                  <SelectItem value="365">Dernière année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value: string) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="cases">Nombre de cas</SelectItem>
                  <SelectItem value="deaths">Nombre de décès</SelectItem>
                  <SelectItem value="date">Date de début</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bouton de réinitialisation des filtres */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                search: '',
                type: 'all',
                country: 'all',
                startDate: '',
                endDate: '',
                sortBy: 'name'
              })}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Onglets pour les différentes vues */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-4 bg-white/70 backdrop-blur-md p-1 rounded-lg">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="epidemics">Épidémies</TabsTrigger>
            <TabsTrigger value="daily-stats">Statistiques quotidiennes</TabsTrigger>
            <TabsTrigger value="locations">Localisations</TabsTrigger>
            <TabsTrigger value="sources">Sources de données</TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800">Total des épidémies</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.global_stats.total_epidemics}</p>
                <p className="text-sm text-gray-600">Dont {stats.global_stats.active_epidemics} actives</p>
              </Card>
              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800">Cas totaux</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.global_stats.total_cases.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Tous pays confondus</p>
              </Card>
              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800">Décès totaux</h3>
                <p className="text-3xl font-bold text-red-600">{stats.global_stats.total_deaths.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Impact global</p>
              </Card>
              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800">Taux de mortalité</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.global_stats.mortality_rate.toFixed(2)}%</p>
                <p className="text-sm text-gray-600">Moyenne mondiale</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution temporelle</h3>
                <LineChart
                  data={prepareEvolutionData()}
                />
              </Card>

              <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution par type</h3>
                <DoughnutChart
                  data={prepareTypeDistributionData()}
                />
              </Card>
            </div>
          </TabsContent>

          {/* Contenu de l'onglet Épidémies */}
          <TabsContent value="epidemics">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
              {sectionLoading.epidemics ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Pays</TableHead>
                          <TableHead>Date de début</TableHead>
                          <TableHead>Date de fin</TableHead>
                          <TableHead>Cas totaux</TableHead>
                          <TableHead>Décès totaux</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {epidemics.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                              Aucune épidémie ne correspond aux critères de recherche
                            </TableCell>
                          </TableRow>
                        ) : (
                          epidemics.map((epidemic) => (
                            <TableRow key={epidemic.id} className="hover:bg-white/40 transition-colors">
                              <TableCell className="font-medium">{epidemic.name}</TableCell>
                              <TableCell>{epidemic.type}</TableCell>
                              <TableCell>{epidemic.country}</TableCell>
                              <TableCell>{format(new Date(epidemic.startDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>
                                {epidemic.endDate ? format(new Date(epidemic.endDate), 'dd/MM/yyyy') : '-'}
                              </TableCell>
                              <TableCell>{epidemic.totalCases.toLocaleString()}</TableCell>
                              <TableCell>{epidemic.totalDeaths.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={epidemic.active ? "default" : "secondary"}>
                                  {epidemic.active ? 'Active' : 'Terminée'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination />
                </>
              )}
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Statistiques quotidiennes */}
          <TabsContent value="daily-stats">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
              {sectionLoading.dailyStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Épidémie</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Cas totaux</TableHead>
                        <TableHead>Cas actifs</TableHead>
                        <TableHead>Décès</TableHead>
                        <TableHead>Guérisons</TableHead>
                        <TableHead>Nouveaux cas</TableHead>
                        <TableHead>Nouveaux décès</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredDailyStats().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                            Aucune statistique quotidienne ne correspond aux critères de recherche
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredDailyStats().map((stat) => (
                          <TableRow key={stat.id} className="hover:bg-white/40 transition-colors">
                            <TableCell>{format(new Date(stat.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{stat.epidemic.name}</TableCell>
                            <TableCell>{stat.location.country}</TableCell>
                            <TableCell>{stat.cases.toLocaleString()}</TableCell>
                            <TableCell>{stat.active.toLocaleString()}</TableCell>
                            <TableCell>{stat.deaths.toLocaleString()}</TableCell>
                            <TableCell>{stat.recovered.toLocaleString()}</TableCell>
                            <TableCell>{stat.new_cases.toLocaleString()}</TableCell>
                            <TableCell>{stat.new_deaths.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Localisations */}
          <TabsContent value="locations">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
              {sectionLoading.locations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pays</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Code ISO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredLocations().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            Aucune localisation ne correspond aux critères de recherche
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredLocations().map((location) => (
                          <TableRow key={location.id} className="hover:bg-white/40 transition-colors">
                            <TableCell className="font-medium">{location.country}</TableCell>
                            <TableCell>{location.region || '-'}</TableCell>
                            <TableCell>{location.iso_code || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Sources de données */}
          <TabsContent value="sources">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
              {sectionLoading.sources ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type de source</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredDataSources().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            Aucune source de données ne correspond aux critères de recherche
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredDataSources().map((source) => (
                          <TableRow key={source.id} className="hover:bg-white/40 transition-colors">
                            <TableCell className="font-medium">{source.source_type}</TableCell>
                            <TableCell>{source.reference || '-'}</TableCell>
                            <TableCell>
                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {source.url}
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 