'use client';

import { useState, useEffect } from 'react';
import { apiClient, DashboardStats, Pandemic, DailyStats, Localisation, DataSource } from '../lib/api';
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
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: '',
    country: '',
    startDate: '',
    endDate: '',
    sortBy: 'name'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, epidemicsData, dailyStatsData, locationsData, dataSourcesData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getPandemics(),
        apiClient.getDailyStats(),
        apiClient.getLocations(),
        apiClient.getDataSources()
      ]);

      setStats(statsData);
      setEpidemics(epidemicsData);
      setDailyStats(dailyStatsData);
      setLocations(locationsData);
      setDataSources(dataSourcesData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type === 'all' ? 'Tous les types' : type}</SelectItem>
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country === 'all' ? 'Tous les pays' : country}</SelectItem>
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date de début" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toute la période</SelectItem>
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
                <SelectTrigger className="w-40">
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
                    {epidemics.map((epidemic) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Statistiques quotidiennes */}
          <TabsContent value="daily-stats">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
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
                    {dailyStats.map((stat) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Localisations */}
          <TabsContent value="locations">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
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
                    {locations.map((location) => (
                      <TableRow key={location.id} className="hover:bg-white/40 transition-colors">
                        <TableCell className="font-medium">{location.country}</TableCell>
                        <TableCell>{location.region || '-'}</TableCell>
                        <TableCell>{location.iso_code || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Sources de données */}
          <TabsContent value="sources">
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg p-6">
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
                    {dataSources.map((source) => (
                      <TableRow key={source.id} className="hover:bg-white/40 transition-colors">
                        <TableCell className="font-medium">{source.source_type}</TableCell>
                        <TableCell>{source.reference || '-'}</TableCell>
                        <TableCell>
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {source.url}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 