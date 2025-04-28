'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import EpidemicManager from '../features/management/EpidemicManager';
import DailyStatsManager from '../features/management/DailyStatsManager';
import LocationManager from '../features/management/LocationManager';
import DataSourceManager from '../features/management/DataSourceManager';

export default function CRUDPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Gestion des données</h1>

            <Tabs defaultValue="epidemics" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="epidemics">Pandémies</TabsTrigger>
                    <TabsTrigger value="dailyStats">Entrées journalières</TabsTrigger>
                    <TabsTrigger value="locations">Localisations</TabsTrigger>
                    <TabsTrigger value="sources">Sources de données</TabsTrigger>
                </TabsList>

                <TabsContent value="epidemics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des pandémies</CardTitle>
                            <CardDescription>
                                Ajouter, modifier ou supprimer des pandémies
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EpidemicManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dailyStats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Entrées journalières</CardTitle>
                            <CardDescription>
                                Gérer les données quotidiennes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyStatsManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Localisations</CardTitle>
                            <CardDescription>
                                Gérer les zones géographiques
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LocationManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sources">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sources de données</CardTitle>
                            <CardDescription>
                                Gérer les sources d'API
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataSourceManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 