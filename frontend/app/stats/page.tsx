'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import Link from 'next/link';

interface DailyStatsEntry {
  id: string;
  epidemic: string;
  date: string;
  location: string;
  cases: number;
  deaths: number;
  active: number;
  recovered: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<DailyStatsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    epidemic: '',
    location: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    // Charger les données
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Cette API n'existe pas encore, nous utilisons des données de test
      // const data = await apiClient.getDailyStats(filters);
      
      // Données de test pour la démo
      const mockData: DailyStatsEntry[] = [
        {
          id: '1',
          epidemic: 'COVID-19',
          date: '2023-01-01',
          location: 'France',
          cases: 2500,
          deaths: 45,
          active: 1200,
          recovered: 1255
        },
        {
          id: '2',
          epidemic: 'COVID-19',
          date: '2023-01-02',
          location: 'France',
          cases: 2700,
          deaths: 50,
          active: 1300,
          recovered: 1350
        },
        {
          id: '3',
          epidemic: 'COVID-19',
          date: '2023-01-01',
          location: 'Allemagne',
          cases: 3500,
          deaths: 65,
          active: 1800,
          recovered: 1635
        },
        {
          id: '4',
          epidemic: 'Grippe Espagnole',
          date: '1918-10-01',
          location: 'États-Unis',
          cases: 25000,
          deaths: 1200,
          active: 15000,
          recovered: 8800
        },
        {
          id: '5',
          epidemic: 'Grippe Espagnole',
          date: '1918-10-02',
          location: 'États-Unis',
          cases: 27500,
          deaths: 1350,
          active: 16500,
          recovered: 9650
        },
      ];
      
      setStats(mockData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Dans une implémentation réelle, cette fonction ferait un appel API avec les filtres
    // Pour la démo, filtrons les données localement
    loadStats();
  };

  const resetFilters = () => {
    setFilters({
      epidemic: '',
      location: '',
      dateFrom: '',
      dateTo: '',
    });
    loadStats();
  };

  // Fonction pour filtrer les données côté client (pour la démo)
  const filteredStats = stats.filter(stat => {
    if (filters.epidemic && !stat.epidemic.toLowerCase().includes(filters.epidemic.toLowerCase())) {
      return false;
    }
    if (filters.location && !stat.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && new Date(stat.date) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(stat.date) > new Date(filters.dateTo)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistiques détaillées</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explorez les données épidémiologiques journalières par lieu et période
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pandémie
            </label>
            <input
              type="text"
              value={filters.epidemic}
              onChange={(e) => setFilters({...filters, epidemic: e.target.value})}
              placeholder="Ex: COVID-19"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Localisation
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              placeholder="Ex: France"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Réinitialiser
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-white dark:bg-gray-800 overflow-x-auto rounded-lg shadow">
        {loading ? (
          <div className="p-4 text-center">Chargement...</div>
        ) : filteredStats.length === 0 ? (
          <div className="p-4 text-center">Aucune donnée trouvée</div>
        ) : (
          <>
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3">Pandémie</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Localisation</th>
                  <th className="px-6 py-3">Cas</th>
                  <th className="px-6 py-3">Décès</th>
                  <th className="px-6 py-3">Actifs</th>
                  <th className="px-6 py-3">Guéris</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((stat) => (
                  <tr key={stat.id} className="border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium">{stat.epidemic}</td>
                    <td className="px-6 py-4">{new Date(stat.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{stat.location}</td>
                    <td className="px-6 py-4">{stat.cases.toLocaleString()}</td>
                    <td className="px-6 py-4">{stat.deaths.toLocaleString()}</td>
                    <td className="px-6 py-4">{stat.active.toLocaleString()}</td>
                    <td className="px-6 py-4">{stat.recovered.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 text-right">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {filteredStats.length} entrées sur {stats.length} au total
              </span>
            </div>
          </>
        )}
      </div>

      {/* Liens rapides */}
      <div className="flex space-x-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Voir le tableau de bord
        </Link>
        <Link href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
} 