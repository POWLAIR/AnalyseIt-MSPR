'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Pandemic } from '../../lib/api';

export default function EpidemicsAdmin() {
  const [pandemics, setPandemics] = useState<Pandemic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPandemic, setSelectedPandemic] = useState<Pandemic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadPandemics();
  }, []);

  const loadPandemics = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getPandemics();
      setPandemics(data);
    } catch (error) {
      console.error('Failed to load pandemics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPandemic(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (pandemic: Pandemic) => {
    setSelectedPandemic(pandemic);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pandémie ?')) {
      return;
    }

    try {
      // Attente de l'implémentation d'API de suppression
      // await apiClient.deletePandemic(id);
      alert('La pandémie a été supprimée avec succès (simulation)');
      
      // Mise à jour locale des données pour la démo
      setPandemics(pandemics.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete pandemic:', error);
      alert('Erreur lors de la suppression de la pandémie');
    }
  };

  const filteredPandemics = pandemics.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.country.toLowerCase().includes(filter.toLowerCase()) ||
    p.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Pandémies</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ajoutez, modifiez ou supprimez des informations sur les pandémies
          </p>
        </div>
        <div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Ajouter une pandémie
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Rechercher
            </label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Nom, pays ou type..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Actions
            </label>
            <button
              onClick={loadPandemics}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Pandemics List */}
      <div className="bg-white dark:bg-gray-800 overflow-x-auto rounded-lg shadow">
        {loading ? (
          <div className="p-4 text-center">Chargement...</div>
        ) : filteredPandemics.length === 0 ? (
          <div className="p-4 text-center">Aucune pandémie trouvée</div>
        ) : (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Nom</th>
                <th className="px-6 py-3">Pays</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Date de début</th>
                <th className="px-6 py-3">Date de fin</th>
                <th className="px-6 py-3">Cas</th>
                <th className="px-6 py-3">Décès</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPandemics.map((pandemic) => (
                <tr key={pandemic.id} className="border-b dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{pandemic.name}</td>
                  <td className="px-6 py-4">{pandemic.country}</td>
                  <td className="px-6 py-4">{pandemic.type}</td>
                  <td className="px-6 py-4">{new Date(pandemic.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{pandemic.endDate ? new Date(pandemic.endDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">{pandemic.totalCases.toLocaleString()}</td>
                  <td className="px-6 py-4">{pandemic.totalDeaths.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pandemic)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(pandemic.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back to Admin */}
      <div className="mt-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Retour à l'administration
        </Link>
      </div>

      {/* Modal for Create/Edit - Implementation simplifiée pour la démo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Ajouter une pandémie' : 'Modifier la pandémie'}
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                Formulaire d'édition des pandémies à implémenter ici
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Fonctionnalité à implémenter');
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 