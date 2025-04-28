'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import DailyStatsManager from "../features/management/DailyStatsManager";
import DataSourceManager from "../features/management/DataSourceManager";
import EpidemicManager from "../features/management/EpidemicManager";
import LocationManager from "../features/management/LocationManager";
import PageWrapper from "../components/shared/PageWrapper";
import { Button } from "../components/ui/button";
import { apiClient } from "../lib/api";

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInitDb = async (reset: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await apiClient.initDatabase(reset);
            setSuccess(`Base de données ${reset ? 'réinitialisée' : 'initialisée'} avec succès`);
        } catch (err) {
            setError('Une erreur est survenue lors de l\'initialisation de la base de données');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunETL = async (reset: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await apiClient.runETL(reset);
            setSuccess(`Processus ETL exécuté avec succès${reset ? ' (données réinitialisées)' : ''}`);
        } catch (err) {
            setError('Une erreur est survenue lors de l\'exécution du processus ETL');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="container mx-auto py-6">
                <h1 className="text-3xl font-bold mb-6">Administration</h1>

                {/* Boutons d'administration de la base de données */}
                <div className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Gestion de la base de données</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => handleInitDb(false)}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? 'Chargement...' : 'Initialiser la base de données'}
                        </Button>
                        <Button
                            onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la structure de la base de données ? Cela supprimera toutes les tables existantes.')) {
                                    handleInitDb(true);
                                }
                            }}
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {loading ? 'Chargement...' : 'Réinitialiser la structure'}
                        </Button>
                        <Button
                            onClick={() => handleRunETL(false)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading ? 'Chargement...' : 'Exécuter le processus ETL'}
                        </Button>
                        <Button
                            onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données avant d\'exécuter le processus ETL ? Cela supprimera toutes les données existantes.')) {
                                    handleRunETL(true);
                                }
                            }}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? 'Chargement...' : 'Réinitialiser et exécuter ETL'}
                        </Button>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                        <p><strong>Initialiser la base de données :</strong> Crée les tables nécessaires si elles n'existent pas.</p>
                        <p><strong>Réinitialiser la structure :</strong> Supprime et recrée toutes les tables (attention : perte de données).</p>
                        <p><strong>Exécuter le processus ETL :</strong> Charge les données depuis les sources externes sans supprimer les données existantes.</p>
                        <p><strong>Réinitialiser et exécuter ETL :</strong> Supprime toutes les données existantes avant de charger de nouvelles données.</p>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
                            {success}
                        </div>
                    )}
                </div>

                {/* Onglets de gestion */}
                <Tabs defaultValue="locations" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="locations">Localisations</TabsTrigger>
                        <TabsTrigger value="epidemics">Épidémies</TabsTrigger>
                        <TabsTrigger value="dailyStats">Statistiques Journalières</TabsTrigger>
                        <TabsTrigger value="dataSources">Sources de Données</TabsTrigger>
                    </TabsList>

                    <TabsContent value="locations" className="mt-6">
                        <LocationManager />
                    </TabsContent>

                    <TabsContent value="epidemics" className="mt-6">
                        <EpidemicManager />
                    </TabsContent>

                    <TabsContent value="dailyStats" className="mt-6">
                        <DailyStatsManager />
                    </TabsContent>

                    <TabsContent value="dataSources" className="mt-6">
                        <DataSourceManager />
                    </TabsContent>
                </Tabs>
            </div>
        </PageWrapper>
    );
} 