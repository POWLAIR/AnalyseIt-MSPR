'use client';

import { useState, useEffect } from 'react';
import { apiClient, DetailedPandemic } from '../../lib/api';
import DetailedCharts from '../../components/DetailedCharts';

export default function DetailedAnalysis() {
  const [detailedData, setDetailedData] = useState<DetailedPandemic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPandemicId, setSelectedPandemicId] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadDetailedData();
  }, [currentPage]);

  const loadDetailedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const skip = (currentPage - 1) * pageSize;
      const result = await apiClient.getDetailedData(skip, pageSize);
      
      if (result && result.epidemics && result.epidemics.length > 0) {
        setDetailedData(result.epidemics);
        setTotalCount(result.totalCount);
        
        // Sélectionner la première pandémie par défaut
        if (!selectedPandemicId && result.epidemics.length > 0) {
          setSelectedPandemicId(result.epidemics[0].id);
        }
      } else {
        setError('Aucune donnée détaillée disponible');
      }
    } catch (error) {
      console.error('Error loading detailed data:', error);
      setError('Erreur lors du chargement des données détaillées');
    } finally {
      setLoading(false);
    }
  };

  const handlePandemicSelect = (id: number) => {
    setSelectedPandemicId(id);
  };

  const selectedPandemic = detailedData.find(p => p.id === selectedPandemicId);
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="text-xl font-semibold mb-2">Chargement des données détaillées...</div>
          <div className="text-gray-600">Veuillez patienter pendant que nous analysons les informations.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Analyse détaillée des pandémies</h1>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => loadDetailedData()} 
            className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1 p-2 rounded hover:bg-gray-100"
            title="Rafraîchir les données"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
            </svg>
            <span>Rafraîchir</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm rounded-lg bg-red-50 text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Pandémies ({totalCount})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {detailedData.map(pandemic => (
                <button
                  key={pandemic.id}
                  onClick={() => handlePandemicSelect(pandemic.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedPandemicId === pandemic.id 
                      ? 'bg-primary-50 border-l-4 border-l-primary-500' 
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">{pandemic.name}</div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{pandemic.country}</span>
                    <span>{pandemic.active ? 'Active' : 'Terminée'}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 space-y-8">
          {!selectedPandemic ? (
            <div className="glass-card p-6 text-center">
              <p className="text-lg text-gray-600 mb-2">
                Sélectionnez une pandémie pour voir son analyse détaillée
              </p>
            </div>
          ) : (
            <div className="glass-card p-6">
              <DetailedCharts pandemic={selectedPandemic} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 