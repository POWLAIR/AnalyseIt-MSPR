'use client';

import { useState, useEffect } from 'react';
import { apiClient } from './lib/api';
import Card from './components/Card';
import Link from 'next/link';
import QuickAccess from './components/QuickAccess';
import { DashboardIcon, AdminIcon, DocumentTextIcon } from './components/Icons';

export default function Home() {
  const [stats, setStats] = useState<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');

  const quickAccessItems = [
    {
      title: "Tableau de bord",
      description: "Visualisation des données",
      href: "/dashboard"
    },
    {
      title: "Administration",
      description: "Gestion des données",
      href: "/admin"
    },
    {
      title: "Statistiques",
      description: "Données détaillées",
      href: "/stats"
    }
  ];

  useEffect(() => {
    // Charger les statistiques au chargement initial
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setDataStatus('loading');
    const statsData = await apiClient.getPandemicStats();
    if (statsData) {
      setStats(statsData);
      setDataStatus('available');
    } else {
      setStats(null);
      setDataStatus('unavailable');
    }
  };

  const handleInitDb = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/admin/init-db?reset=true', {
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
      const response = await fetch('/api/v1/admin/run-etl?reset=true', {
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
      <section className="glass-card p-8 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-4 text-primary-950 dark:text-white text-center sm:text-left">
          AnalyzeIT - Plateforme de données pandémiques
        </h1>
        <p className="text-lg text-text-secondary dark:text-gray-300 mb-6">
          Bienvenue sur la plateforme de gestion et d'analyse des données pandémiques. 
          Avant de commencer, vous devez initialiser la base de données et charger les données.
        </p>

        {/* Instructions */}
        <div className="p-4 mb-6 text-sm rounded-lg bg-primary-50/70 backdrop-blur-sm text-primary-950 dark:bg-primary-900/30 dark:text-primary-300 border border-glass">
          <p className="font-semibold mb-2">Pour démarrer :</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Cliquez sur "Réinitialiser la base de données" pour créer les tables nécessaires</li>
            <li>Cliquez sur "Charger les données" pour importer les données de test</li>
            <li>Explorez ensuite les différentes fonctionnalités de la plateforme</li>
          </ol>
          <p className="mt-2 text-sm italic">Note : Ces actions supprimeront toutes les données existantes!</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleInitDb}
            disabled={loading}
            className="glass-button w-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Réinitialiser la base de données'}
          </button>
          <button
            onClick={handleRunEtl}
            disabled={loading}
            className="glass-button-outline w-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Charger les données'}
          </button>
        </div>

        {/* Message de statut */}
        {message && (
          <div className="p-4 mb-6 text-sm rounded-lg bg-accent-turquoise/10 backdrop-blur-sm text-accent-turquoise border border-glass">
            {message}
          </div>
        )}
      </section>

      {/* Key Indicators */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-primary-950 dark:text-white">État de la plateforme</h2>
        
        {dataStatus === 'loading' && (
          <div className="p-6 text-center glass-card">
            Chargement des données...
          </div>
        )}
        
        {dataStatus === 'unavailable' && (
          <div className="p-6 text-center glass-card">
            <p className="text-text-primary dark:text-gray-300 mb-2">Les données ne sont pas disponibles</p>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Veuillez initialiser la base de données et charger les données en utilisant les boutons ci-dessus.
            </p>
          </div>
        )}
        
        {dataStatus === 'available' && stats && (
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
      </section>

      {/* Navigation rapide */}
      <QuickAccess items={quickAccessItems} />
    </div>
  );
}
