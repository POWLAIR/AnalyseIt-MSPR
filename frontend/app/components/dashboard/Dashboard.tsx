'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { apiClient } from '../../lib/api';
import { format } from 'date-fns';
import { useToast } from "../../components/ui/use-toast";
import LineChart from '../charts/LineChart';
import DoughnutChart from '../charts/DoughnutChart';
import BarChart from '../charts/BarChart';

interface DashboardStats {
    global_stats: {
        total_cases: number;
        total_deaths: number;
        total_epidemics: number;
        active_epidemics: number;
        mortality_rate: number;
    };
    type_distribution: Array<{
        type: string;
        cases: number;
        deaths: number;
    }>;
    geographic_distribution: Array<{
        country: string;
        cases: number;
        deaths: number;
    }>;
    daily_evolution: Array<{
        date: string;
        new_cases: number;
        new_deaths: number;
        active_cases: number;
    }>;
    top_active_epidemics: Array<{
        id: number;
        name: string;
        type: string;
        country: string;
        total_cases: number;
        total_deaths: number;
    }>;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await apiClient.getDashboardStats();
                setStats(data);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setError('Erreur lors du chargement des statistiques');
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Impossible de charger les statistiques du tableau de bord"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-4 w-[150px] bg-gray-200 animate-pulse rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-[100px] bg-gray-200 animate-pulse rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Erreur</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{error || 'Données non disponibles'}</p>
                </CardContent>
            </Card>
        );
    }

    // Préparation des données pour les graphiques
    const hasEvolutionData = stats.daily_evolution.length > 0;
    const hasTypeData = stats.type_distribution.length > 0;
    const hasGeoData = stats.geographic_distribution.length > 0;
    const hasTopEpidemics = stats.top_active_epidemics.length > 0;

    const evolutionData = {
        labels: hasEvolutionData
            ? stats.daily_evolution.map(day => format(new Date(day.date), 'dd/MM/yyyy'))
            : ['Aucune donnée'],
        datasets: [
            {
                label: 'Nouveaux cas',
                data: hasEvolutionData
                    ? stats.daily_evolution.map(day => day.new_cases)
                    : [0],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Nouveaux décès',
                data: hasEvolutionData
                    ? stats.daily_evolution.map(day => day.new_deaths)
                    : [0],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const typeDistributionData = {
        labels: hasTypeData
            ? stats.type_distribution.map(item => item.type)
            : ['Aucune donnée'],
        datasets: [{
            label: 'Cas par type',
            data: hasTypeData
                ? stats.type_distribution.map(item => item.cases)
                : [0],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)'
            ]
        }]
    };

    const geoDistributionData = {
        labels: hasGeoData
            ? stats.geographic_distribution.map(item => item.country)
            : ['Aucune donnée'],
        datasets: [{
            label: 'Cas par pays',
            data: hasGeoData
                ? stats.geographic_distribution.map(item => item.cases)
                : [0],
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
        }]
    };

    const noDataMessage = (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>Aucune donnée disponible</p>
        </div>
    );

    return (
        <div className="space-y-4 relative">
            {/* Fond décoratif */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 -z-10 rounded-lg"></div>

            {/* Statistiques globales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Total des épidémies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-900">{stats.global_stats.total_epidemics}</p>
                        <p className="text-xs text-gray-600">
                            dont {stats.global_stats.active_epidemics} actives
                        </p>
                    </CardContent>
                </Card>
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Total des cas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.global_stats.total_cases.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Total des décès</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.global_stats.total_deaths.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Taux de mortalité</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.global_stats.mortality_rate.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Évolution quotidienne</CardTitle>
                        <CardDescription className="text-gray-600">Nouveaux cas et décès sur les 30 derniers jours</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white/50 p-4 rounded-b-lg">
                        {hasEvolutionData ? (
                            <LineChart data={evolutionData} />
                        ) : (
                            noDataMessage
                        )}
                    </CardContent>
                </Card>
                <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Distribution par type</CardTitle>
                        <CardDescription className="text-gray-600">Répartition des cas par type d'épidémie</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white/50 p-4 rounded-b-lg">
                        {hasTypeData ? (
                            <DoughnutChart data={typeDistributionData} />
                        ) : (
                            noDataMessage
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-800">Distribution géographique</CardTitle>
                    <CardDescription className="text-gray-600">Nombre de cas par pays</CardDescription>
                </CardHeader>
                <CardContent className="bg-white/50 p-4 rounded-b-lg">
                    {hasGeoData ? (
                        <BarChart data={geoDistributionData} />
                    ) : (
                        noDataMessage
                    )}
                </CardContent>
            </Card>

            {/* Top des épidémies actives */}
            <Card className="backdrop-blur-md bg-white/70 border border-white/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-800">Top 5 des épidémies actives</CardTitle>
                    <CardDescription className="text-gray-600">Les épidémies les plus importantes en cours</CardDescription>
                </CardHeader>
                <CardContent className="bg-white/50 p-4 rounded-b-lg">
                    {hasTopEpidemics ? (
                        <div className="space-y-4">
                            {stats.top_active_epidemics.map(epidemic => (
                                <div key={epidemic.id}
                                    className="flex items-center justify-between p-4 rounded-lg 
                                    backdrop-blur-sm bg-white/40 border border-white/50
                                    hover:bg-white/60 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{epidemic.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {epidemic.type} - {epidemic.country}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">{epidemic.total_cases.toLocaleString()} cas</p>
                                        <p className="text-sm text-gray-600">
                                            {epidemic.total_deaths.toLocaleString()} décès
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        noDataMessage
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 