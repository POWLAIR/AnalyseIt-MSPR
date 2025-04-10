'use client';

import { useState } from 'react';
import { Button } from './components/ui/button';
import { apiClient } from './lib/api';
import PageWrapper from './components/shared/PageWrapper';
import { ArrowRight, Activity, BarChart2, Globe, RefreshCw } from 'lucide-react';

function HomeContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitDb = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.initDatabase();
      await apiClient.runETL();
      window.location.reload();
    } catch (err) {
      setError('Une erreur est survenue lors de l\'initialisation de la base de données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      title: "Surveillance en Temps Réel",
      description: "Suivez l'évolution des épidémies avec des mises à jour en temps réel des données."
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-blue-500" />,
      title: "Analyses Détaillées",
      description: "Accédez à des analyses statistiques approfondies et des visualisations interactives."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "Couverture Mondiale",
      description: "Surveillez les épidémies à l'échelle mondiale avec des données géolocalisées."
    }
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-24 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Fonctionnalités Principales
          </h2>
          <p className="text-gray-500 text-lg">
            Découvrez comment AnalyseIt vous aide à mieux comprendre et suivre l'évolution des épidémies.
          </p>
        </div>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow flex items-start gap-6"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <PageWrapper>
      <HomeContent />
    </PageWrapper>
  );
}
