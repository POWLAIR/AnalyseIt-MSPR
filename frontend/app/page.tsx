'use client';

import { useState } from 'react';
import { apiClient } from './lib/api';
import Card from './components/Card';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    totalPandemics: 0,
    activePandemics: 0,
    averageTransmissionRate: 0,
    averageMortalityRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    const statsData = await apiClient.getPandemicStats();
    setStats(statsData);
  };

  const handleInitDb = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/admin/init-db', {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message || 'Base de données initialisée avec succès!');
      await fetchStats();
    } catch (error) {
      setMessage('Erreur: Impossible d\'initialiser la base de données.');
      console.error('Error initializing database:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEtl = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/admin/run-etl', {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message || 'Données chargées avec succès!');
      await fetchStats();
    } catch (error) {
      setMessage('Erreur: Impossible de charger les données.');
      console.error('Error running ETL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center sm:text-left">
          AnalyseIt - Plateforme de données pandémiques
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Bienvenue sur la plateforme de gestion et d'analyse des données pandémiques. 
          Utilisez les outils ci-dessous pour initialiser la plateforme et charger les données.
        </p>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleInitDb}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Initialiser la base de données'}
          </button>
          <button
            onClick={handleRunEtl}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Charger les données (ETL)'}
          </button>
        </div>

        {/* Message de statut */}
        {message && (
          <div className="p-4 mb-6 text-sm rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {message}
          </div>
        )}
      </section>

      {/* Key Indicators */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">État de la plateforme</h2>
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
      </section>

      {/* Navigation rapide */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard" 
                className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-xl font-semibold">Tableau de bord</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Visualisation des données</span>
          </Link>
          <Link href="/admin" 
                className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-xl font-semibold">Administration</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Gestion des données</span>
          </Link>
          <Link href="/stats" 
                className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="text-xl font-semibold">Statistiques</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Données détaillées</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
