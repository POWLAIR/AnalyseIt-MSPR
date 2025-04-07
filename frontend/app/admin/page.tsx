'use client';

import React, { useState, useEffect } from 'react';
import AdminQuickAccess from '../components/AdminQuickAccess';
import Card from '../components/Card';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Dans une implémentation réelle, nous ferions un appel API ici
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);
        
        // Pour l'instant, nous signalons juste que les données ne sont pas disponibles
        setStats(null);
        setError("Les données d'administration ne sont pas encore disponibles.");
      } catch (err) {
        setError("Erreur lors du chargement des données d'administration.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <section className="glass-card p-8 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-4 text-primary-950 dark:text-white">
          Administration
        </h1>
        <p className="text-lg text-text-primary dark:text-gray-300 mb-6">
          Gérez les données et configurations de la plateforme dans cet espace d'administration.
        </p>
      </section>
      
      {/* Statistiques d'administration */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-primary-950 dark:text-white">Aperçu des données</h2>
        
        {isLoading ? (
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse">
              <div className="text-text-primary dark:text-gray-300">Chargement des données...</div>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card p-8">
            <div className="text-text-primary dark:text-gray-300 text-center">
              {error}
            </div>
            <div className="flex justify-center mt-4">
              <button className="glass-button">
                Configurer les sources de données
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card
              title="Pandémies"
              value={stats?.pandemics || "—"}
              description="Enregistrées au total"
            />
            <Card
              title="Entrées"
              value={stats?.entries || "—"}
              description="Entrées journalières"
            />
            <Card
              title="Localités"
              value={stats?.locations || "—"}
              description="Zones surveillées"
            />
            <Card
              title="Sources"
              value={stats?.sources || "—"}
              description="Sources de données"
            />
          </div>
        )}
      </section>

      {/* Section accès rapide admin */}
      <AdminQuickAccess />
      
      {/* Section historique récent */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 text-primary-950 dark:text-white">Activité récente</h2>
        {isLoading ? (
          <div className="animate-pulse p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="text-text-primary dark:text-gray-300 text-center p-6">
            Aucune activité récente disponible.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-glass">
            <table className="min-w-full divide-y divide-glass">
              <thead className="bg-primary-50/70 dark:bg-primary-900/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Entité</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Utilisateur</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm divide-y divide-glass">
                {/* Historique sera alimenté dynamiquement depuis l'API */}
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-text-secondary dark:text-gray-400">
                    Aucune activité récente à afficher
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
} 