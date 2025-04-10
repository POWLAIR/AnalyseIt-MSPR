'use client';

import { useState, useEffect } from 'react';
import { apiClient, DashboardStats } from '../lib/api';
import PageWrapper from '../components/shared/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import { Activity, Users, Skull, AlertCircle } from 'lucide-react';

export default function StatsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardStats = await apiClient.getDashboardStats();
                setStats(dashboardStats);
                setLoading(false);
            } catch (err) {
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

    const statsCards = [
        {
            title: "Épidémies Totales",
            value: stats.global_stats.total_epidemics,
            description: "Nombre total d'épidémies enregistrées",
            icon: <AlertCircle className="h-6 w-6 text-blue-500" />,
            trend: null
        },
        {
            title: "Épidémies Actives",
            value: stats.global_stats.active_epidemics,
            description: "Épidémies en cours",
            icon: <Activity className="h-6 w-6 text-green-500" />,
            trend: null
        },
        {
            title: "Cas Totaux",
            value: stats.global_stats.total_cases.toLocaleString(),
            description: "Nombre total de cas",
            icon: <Users className="h-6 w-6 text-orange-500" />,
            trend: null
        },
        {
            title: "Décès Totaux",
            value: stats.global_stats.total_deaths.toLocaleString(),
            description: "Nombre total de décès",
            icon: <Skull className="h-6 w-6 text-red-500" />,
            trend: null
        }
    ];

    const chartData = {
        dailyEvolution: {
            labels: stats.daily_evolution.map(day => day.date),
            datasets: [
                {
                    label: 'Nouveaux cas',
                    data: stats.daily_evolution.map(day => day.new_cases),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                },
                {
                    label: 'Cas actifs',
                    data: stats.daily_evolution.map(day => day.active_cases),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }
            ]
        },
        typeDistribution: {
            labels: stats.type_distribution.map(type => type.type),
            datasets: [{
                data: stats.type_distribution.map(type => type.cases),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ]
            }]
        },
        geographicDistribution: {
            labels: stats.geographic_distribution.map(geo => geo.country),
            datasets: [{
                label: 'Cas par pays',
                data: stats.geographic_distribution.map(geo => geo.cases),
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
        }
    };

    return (
        <PageWrapper>
            <div className="space-y-8">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
                    <p className="text-gray-600">Vue d'ensemble des épidémies et leurs impacts</p>
                </div>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, index) => (
                        <Card key={index} style={{ backgroundColor: 'white' }}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent >
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card style={{ backgroundColor: 'white' }}>
                        <CardHeader>
                            <CardTitle>Évolution Temporelle</CardTitle>
                            <CardDescription>Évolution des cas sur les 30 derniers jours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart data={chartData.dailyEvolution} />
                        </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: 'white' }}>
                        <CardHeader>
                            <CardTitle>Distribution par Type</CardTitle>
                            <CardDescription>Répartition des cas par type d'épidémie</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PieChart data={chartData.typeDistribution} />
                        </CardContent>
                    </Card>
                </div>

                {/* Top épidémies actives */}
                <Card style={{ backgroundColor: 'white' }}>
                    <CardHeader>
                        <CardTitle>Top 5 des Épidémies Actives</CardTitle>
                        <CardDescription>Les épidémies les plus importantes en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Nom</th>
                                        <th className="text-left py-3 px-4">Type</th>
                                        <th className="text-left py-3 px-4">Pays</th>
                                        <th className="text-right py-3 px-4">Cas</th>
                                        <th className="text-right py-3 px-4">Décès</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.top_active_epidemics.map((epidemic, index) => (
                                        <tr key={epidemic.id} className="border-b last:border-0">
                                            <td className="py-3 px-4">{epidemic.name}</td>
                                            <td className="py-3 px-4">{epidemic.type}</td>
                                            <td className="py-3 px-4">{epidemic.country}</td>
                                            <td className="py-3 px-4 text-right">{epidemic.total_cases.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">{epidemic.total_deaths.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution géographique */}
                <Card style={{ backgroundColor: 'white' }}>
                    <CardHeader>
                        <CardTitle>Distribution Géographique</CardTitle>
                        <CardDescription>Répartition des cas par pays</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <BarChart data={chartData.geographicDistribution} />
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
} 