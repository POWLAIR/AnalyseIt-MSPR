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
  const [stats, setStats] = useState({
    epidemics: 0,
    dailyStats: 0,
    locations: 0,
    dataSources: 0
  });

  useEffect(() => {
    // Ici, vous pourriez vérifier l'authentification
    // et récupérer les statistiques
    
    // Simuler un chargement des stats
    const fetchStats = async () => {
      try {
        // Remplacez ceci par un vrai appel API quand possible
        // const stats = await apiClient.getAdminStats();
        
        // Stats simulées pour la démo
        setStats({
          epidemics: 12,
          dailyStats: 250,
          locations: 45,
          dataSources: 8
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques', error);
      }
    };

    fetchStats();
  }, []);

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

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-6">Administration</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Gérez les données et configurations de la plateforme dans cet espace d'administration.
        </p>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Exporter toutes les données
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Générer rapport PDF
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Synchroniser les sources
          </button>
        </div>
      </section>
    </div>
  );
} 