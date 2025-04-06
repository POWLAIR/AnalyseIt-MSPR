'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api';

// Un composant simple pour une carte d'administration
function AdminCard({ title, description, link, icon }: { 
  title: string; 
  description: string; 
  link: string;
  icon: string;
}) {
  return (
    <Link 
      href={link} 
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg text-xl">
          {icon}
        </div>
        <div>
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(true);  // Pour la démo, true par défaut
  const [stats, setStats] = useState<{
    epidemics: number;
    dailyStats: number;
    locations: number;
    dataSources: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Récupération des données d'administration
  const fetchStats = async () => {
    try {
      setLoading(true);
      // Tentative de récupération des statistiques via l'API
      const pandemicsData = await apiClient.getPandemics();
      
      if (pandemicsData && pandemicsData.length > 0) {
        // Calcul des statistiques basées sur les données disponibles
        // Ici on estime certaines valeurs basées sur les pandémies
        setStats({
          epidemics: pandemicsData.length,
          dailyStats: pandemicsData.reduce((total, pandemic) => total + (pandemic.totalCases || 0), 0),
          locations: [...new Set(pandemicsData.map(p => p.country))].length,
          dataSources: 1 // Valeur fictive car nous n'avons pas cette information
        });
      } else {
        setStats(null);
        setError("Aucune donnée disponible. Veuillez initialiser la base de données.");
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques', error);
      setError("Erreur lors du chargement des données administratives.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupération des données d'administration
    fetchStats();
  }, []);

  const handleInitDb = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetch('/api/v1/admin/init-db?reset=true', {
        method: 'POST',
      });
      const data = await response.json();
      setActionMessage(data.message || 'Base de données initialisée avec succès!');
      // Recharger les statistiques
      fetchStats();
    } catch (error) {
      setActionMessage('Erreur: Impossible d\'initialiser la base de données.');
      console.error('Error initializing database:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunEtl = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetch('/api/v1/admin/run-etl?reset=true', {
        method: 'POST',
      });
      const data = await response.json();
      setActionMessage(data.message || 'Données chargées avec succès!');
      // Recharger les statistiques
      fetchStats();
    } catch (error) {
      setActionMessage('Erreur: Impossible de charger les données.');
      console.error('Error running ETL:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
        <p className="mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Retourner à l'accueil
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="text-xl font-semibold mb-2">Chargement des données administratives...</div>
          <div className="text-gray-600">Veuillez patienter pendant que nous récupérons les informations.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-6">Administration</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Gérez les données et configurations de la plateforme dans cet espace d'administration.
        </p>

        {error && (
          <div className="p-4 mb-6 text-sm rounded-lg bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Statistiques rapides</h2>
          
          {!stats ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Aucune statistique disponible. Veuillez utiliser les boutons ci-dessous pour réinitialiser la base de données et charger des données.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pandémies</p>
                <p className="text-2xl font-bold">{stats.epidemics}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Entrées journalières</p>
                <p className="text-2xl font-bold">{stats.dailyStats}</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Localisations</p>
                <p className="text-2xl font-bold">{stats.locations}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sources de données</p>
                <p className="text-2xl font-bold">{stats.dataSources}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Entités CRUD */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Gestion des entités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard
            title="Pandémies"
            description="Gérer les informations sur les épidémies et pandémies"
            link="/admin/epidemics"
            icon="🦠"
          />
          <AdminCard
            title="Statistiques quotidiennes"
            description="Gérer les données statistiques journalières"
            link="/admin/daily-stats"
            icon="📊"
          />
          <AdminCard
            title="Localisations"
            description="Gérer les pays, régions et zones géographiques"
            link="/admin/locations"
            icon="🌍"
          />
          <AdminCard
            title="Sources de données"
            description="Gérer les sources d'information et leur fiabilité"
            link="/admin/data-sources"
            icon="📚"
          />
          <AdminCard
            title="Statistiques globales"
            description="Gérer les données récapitulatives des pandémies"
            link="/admin/overall-stats"
            icon="📈"
          />
          <AdminCard
            title="Configuration"
            description="Paramètres généraux de la plateforme"
            link="/admin/settings"
            icon="⚙️"
          />
        </div>
      </section>

      {/* Actions rapides */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Actions rapides</h2>
        
        {actionMessage && (
          <div className="p-4 mb-6 text-sm rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {actionMessage}
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleInitDb}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? 'Chargement...' : 'Réinitialiser la base de données'}
          </button>
          <button 
            onClick={handleRunEtl}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading ? 'Chargement...' : 'Charger les données'}
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600" 
            disabled={!stats || actionLoading}
          >
            Synchroniser les sources
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 italic">
          Note : Les actions "Réinitialiser" et "Charger les données" supprimeront les données existantes.
        </p>
      </section>
    </div>
  );
} 