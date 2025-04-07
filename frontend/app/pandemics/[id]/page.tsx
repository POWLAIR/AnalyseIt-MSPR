'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { apiClient } from '../../lib/api';
import ChartContainer from '../../components/ChartContainer';
import Card from '../../components/Card';

// Définition correcte des types pour Next.js App Router
type PageParams = {
  id: string;
};

type PageProps = {
  params: PageParams;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ 
  params 
}: PageProps): Promise<Metadata> {
  return {
    title: `Pandémie ${params.id}`,
  };
}

export default function PandemicDetail({ params }: PageProps) {
  const [pandemic, setPandemic] = useState<any>(null);
  const [pandemicData, setPandemicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const pandemicResult = await apiClient.getPandemicById(params.id);
        const dataResult = await apiClient.getPandemicData(params.id);
        
        if (pandemicResult) {
          setPandemic(pandemicResult);
        } else {
          setError("Pandémie non trouvée");
        }
        
        if (dataResult && dataResult.length > 0) {
          setPandemicData(dataResult);
        } else {
          setPandemicData([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Formatage des données pour les graphiques
  const chartData = {
    labels: pandemicData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Cas',
        data: pandemicData.map(item => item.cases),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Décès',
        data: pandemicData.map(item => item.deaths),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Rétablissements',
        data: pandemicData.map(item => item.recoveries),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="text-xl font-semibold mb-2">Chargement des données...</div>
          <div className="text-gray-600">Veuillez patienter pendant que nous récupérons les informations.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-red-50 text-red-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!pandemic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Pandémie non trouvée</h2>
          <p>Les données pour cette pandémie ne sont pas disponibles.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded flex items-center space-x-1"
        >
          <span className="font-bold">&larr;</span>
          <span>Retour</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-2">{pandemic.name}</h1>
          <div className="text-gray-500 dark:text-gray-400 mb-4">Identifiant: {pandemic.id}</div>
          <p className="text-lg mb-4">{pandemic.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Région</div>
              <div className="font-semibold">{pandemic.region || 'Non spécifié'}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Statut</div>
              <div className="font-semibold">{pandemic.active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Taux de transmission</div>
              <div className="font-semibold">{pandemic.transmissionRate?.toFixed(2)}%</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Taux de mortalité</div>
              <div className="font-semibold">{pandemic.mortalityRate?.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Chronologie</h2>
          <div className="space-y-3">
            {pandemic.startDate && (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded-full flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Date de début</div>
                  <div className="text-gray-600 dark:text-gray-400">{new Date(pandemic.startDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
            
            {pandemic.endDate ? (
              <div className="flex items-start space-x-3">
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-1 rounded-full flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Date de fin</div>
                  <div className="text-gray-600 dark:text-gray-400">{new Date(pandemic.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1 rounded-full flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Statut actuel</div>
                  <div className="text-green-600 dark:text-green-400">En cours</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Évolution des données</h2>
        
        {pandemicData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Aucune donnée disponible pour cette pandémie.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ChartContainer 
              type="line"
              title="Évolution des cas, décès et rétablissements"
              data={chartData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
