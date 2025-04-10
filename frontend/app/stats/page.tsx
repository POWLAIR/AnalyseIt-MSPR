'use client';

import { useState, useEffect } from 'react';
import { apiClient, DashboardStats } from '../lib/api';
import PageWrapper from '../components/shared/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import { Activity, Users, Skull, AlertCircle, TrendingUp, Globe, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StatsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardStats = await apiClient.getDashboardStats();
                console.log('URL appelée:', process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/stats/dashboard');
                console.log('Données reçues brutes:', dashboardStats);
                console.log('Statistiques globales:', dashboardStats?.global_stats);
                console.log('Distribution par type:', dashboardStats?.type_distribution);
                console.log('Distribution géographique:', dashboardStats?.geographic_distribution);
                console.log('Évolution quotidienne:', dashboardStats?.daily_evolution);
                setStats(dashboardStats);
                setLoading(false);
            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError('Erreur lors du chargement des données');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <PageWrapper>
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper>
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
        </PageWrapper>
    );

    if (!stats) return null;

    // Cartes de statistiques globales
    const statsCards = [
        {
            title: "Total des Épidémies",
            value: stats.global_stats.total_epidemics,
            description: "Nombre total d'épidémies enregistrées",
            icon: <Bug className="h-6 w-6 text-purple-500" />,
            color: "text-purple-600"
        },
        {
            title: "Épidémies Actives",
            value: stats.global_stats.active_epidemics,
            description: "Nombre d'épidémies en cours",
            icon: <Activity className="h-6 w-6 text-blue-500" />,
            color: "text-blue-600"
        },
        {
            title: "Cas Totaux",
            value: stats.global_stats.total_cases.toLocaleString(),
            description: "Nombre total de cas toutes épidémies confondues",
            icon: <Users className="h-6 w-6 text-orange-500" />,
            color: "text-orange-600"
        },
        {
            title: "Décès Totaux",
            value: stats.global_stats.total_deaths.toLocaleString(),
            description: "Nombre total de décès",
            icon: <Skull className="h-6 w-6 text-red-500" />,
            color: "text-red-600"
        }
    ];

    // Données pour les graphiques
    const chartData = {
        // Évolution temporelle globale
        globalEvolution: {
            labels: stats.daily_evolution.map(day =>
                format(new Date(day.date), 'dd MMM yyyy', { locale: fr })
            ),
            datasets: [
                {
                    label: 'Nouveaux Cas',
                    data: stats.daily_evolution.map(day => day.new_cases),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Nouveaux Décès',
                    data: stats.daily_evolution.map(day => day.new_deaths),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Cas Actifs',
                    data: stats.daily_evolution.map(day => day.active_cases),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },

        // Distribution par type d'épidémie
        typeDistribution: {
            labels: stats.type_distribution.map(type => type.type),
            datasets: [{
                label: 'Cas par type',
                data: stats.type_distribution.map(type => type.cases),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Bleu
                    'rgba(239, 68, 68, 0.8)',   // Rouge
                    'rgba(16, 185, 129, 0.8)',  // Vert
                    'rgba(245, 158, 11, 0.8)',  // Orange
                    'rgba(139, 92, 246, 0.8)'   // Violet
                ]
            }]
        },

        // Distribution géographique
        geographicDistribution: {
            labels: stats.geographic_distribution.map(geo => geo.country),
            datasets: [
                {
                    label: 'Cas',
                    data: stats.geographic_distribution.map(geo => geo.cases),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Décès',
                    data: stats.geographic_distribution.map(geo => geo.deaths),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },

        // Taux de mortalité par type
        mortalityByType: {
            labels: stats.type_distribution.map(type => type.type),
            datasets: [{
                label: 'Taux de mortalité (%)',
                data: stats.type_distribution.map(type =>
                    type.cases > 0 ? Number(((type.deaths / type.cases) * 100).toFixed(2)) : 0
                ),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        }
    };

    return (
        <PageWrapper>
            <div className="space-y-8">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tableau de Bord Épidémiologique</h1>
                    <p className="text-gray-600">Vue d'ensemble des données épidémiologiques mondiales</p>
                </div>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, index) => (
                        <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Graphiques principaux */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Évolution temporelle */}
                    <Card className="bg-white hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Évolution Temporelle</CardTitle>
                            <CardDescription>Progression des cas sur les 30 derniers jours</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <LineChart data={chartData.globalEvolution} />
                        </CardContent>
                    </Card>

                    {/* Distribution par type */}
                    <Card className="bg-white hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Distribution par Type</CardTitle>
                            <CardDescription>Répartition des cas selon le type d'épidémie</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <PieChart data={chartData.typeDistribution} />
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques secondaires */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution géographique */}
                    <Card className="bg-white hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Top 10 Pays Affectés</CardTitle>
                            <CardDescription>Répartition des cas et décès par pays</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <BarChart data={chartData.geographicDistribution} />
                        </CardContent>
                    </Card>

                    {/* Taux de mortalité par type */}
                    <Card className="bg-white hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Taux de Mortalité par Type</CardTitle>
                            <CardDescription>Comparaison des taux de mortalité selon le type d'épidémie</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <BarChart data={chartData.mortalityByType} />
                        </CardContent>
                    </Card>
                </div>

                {/* Épidémies actives */}
                <Card className="bg-white hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Top 5 des Épidémies Actives</CardTitle>
                        <CardDescription>Les épidémies actuellement actives avec le plus grand nombre de cas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Nom</th>
                                        <th className="text-left py-3 px-4">Type</th>
                                        <th className="text-left py-3 px-4">Pays</th>
                                        <th className="text-right py-3 px-4">Cas Totaux</th>
                                        <th className="text-right py-3 px-4">Décès</th>
                                        <th className="text-right py-3 px-4">Taux de Mortalité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.top_active_epidemics.map((epidemic) => (
                                        <tr key={epidemic.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{epidemic.name}</td>
                                            <td className="py-3 px-4">{epidemic.type}</td>
                                            <td className="py-3 px-4">{epidemic.country}</td>
                                            <td className="py-3 px-4 text-right">{epidemic.total_cases.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">{epidemic.total_deaths.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                {epidemic.total_cases > 0
                                                    ? ((epidemic.total_deaths / epidemic.total_cases) * 100).toFixed(2)
                                                    : '0.00'}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
} 