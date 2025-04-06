'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPandemicsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pandemics, setPandemics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPandemics = async () => {
      try {
        setIsLoading(true);
        // Dans une implémentation réelle, nous ferions un appel API ici
        // const response = await fetch('/api/admin/pandemics');
        // const data = await response.json();
        // setPandemics(data);
        
        // Pour l'instant, nous signalons juste que les données ne sont pas disponibles
        setPandemics([]);
        setError("La fonctionnalité de gestion des pandémies n'est pas encore implémentée.");
      } catch (err) {
        setError("Erreur lors du chargement des données de pandémies.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPandemics();
  }, []);

  return (
    <div className="space-y-8">
      <section className="glass-card p-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary-950 dark:text-white">
              Gestion des pandémies
            </h1>
            <p className="text-text-secondary dark:text-gray-400">
              Ajoutez, modifiez ou supprimez des informations sur les pandémies
            </p>
          </div>
          <Link 
            href="/admin" 
            className="mt-4 sm:mt-0 glass-button-outline inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'administration
          </Link>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center mb-6">
          <button className="glass-button inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une pandémie
          </button>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xs border border-glass text-text-primary dark:text-white rounded-lg pl-10 pr-4 py-2 focus:ring-accent-turquoise focus:border-accent-turquoise"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-text-secondary dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tableau des pandémies */}
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
              <Link href="/admin" className="glass-button">
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        ) : pandemics.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-text-primary dark:text-gray-300 mb-4">
              Aucune pandémie enregistrée
            </div>
            <button className="glass-button">
              Ajouter votre première pandémie
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-glass">
              <table className="min-w-full divide-y divide-glass">
                <thead className="bg-primary-50/70 dark:bg-primary-900/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Nom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Période</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm divide-y divide-glass">
                  {pandemics.map((pandemic) => (
                    <tr key={pandemic.id} className="hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-950 dark:text-white">
                        {pandemic.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${pandemic.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          pandemic.status === 'Terminée' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' : 
                          pandemic.status === 'Surveillance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}
                        >
                          {pandemic.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-gray-300">
                        {pandemic.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-gray-300">
                        {pandemic.startYear} - {pandemic.endYear || 'Présent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-accent-turquoise hover:text-primary-600 dark:hover:text-primary-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-500 hover:text-red-600 dark:hover:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-text-secondary dark:text-gray-400">
                Affichage de 1 à {pandemics.length} sur {pandemics.length} entrées
              </div>
              <div className="flex space-x-2">
                <button className="glass-button-outline py-1 px-2 text-sm disabled:opacity-50" disabled>
                  Précédent
                </button>
                <button className="glass-button py-1 px-3 text-sm">
                  1
                </button>
                <button className="glass-button-outline py-1 px-2 text-sm disabled:opacity-50" disabled>
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
} 