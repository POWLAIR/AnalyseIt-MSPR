import React, { useMemo } from 'react';
import ChartContainer from './ChartContainer';
import { DetailedPandemic } from '../lib/api';

interface DetailedChartsProps {
  pandemic: DetailedPandemic;
}

const DetailedCharts: React.FC<DetailedChartsProps> = ({ pandemic }) => {
  // Données pour le graphique d'évolution des nouveaux cas vs récupérations
  const newCasesVsRecoveryData = useMemo(() => {
    if (!pandemic.daily_stats || pandemic.daily_stats.length === 0) {
      return null;
    }

    // Trier les statistiques par date
    const sortedStats = [...pandemic.daily_stats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString();
      }),
      newCases: sortedStats.map(stat => stat.new_cases),
      newRecoveries: sortedStats.map(stat => stat.new_recovered),
      newDeaths: sortedStats.map(stat => stat.new_deaths),
    };
  }, [pandemic.daily_stats]);

  // Données pour le graphique des cas actifs vs totaux
  const activeCasesData = useMemo(() => {
    if (!pandemic.daily_stats || pandemic.daily_stats.length === 0) {
      return null;
    }

    // Trier les statistiques par date
    const sortedStats = [...pandemic.daily_stats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString();
      }),
      active: sortedStats.map(stat => stat.active),
      total: sortedStats.map(stat => stat.cases),
    };
  }, [pandemic.daily_stats]);

  // Données pour le graphique du taux de létalité au fil du temps
  const fatalityRateData = useMemo(() => {
    if (!pandemic.daily_stats || pandemic.daily_stats.length === 0) {
      return null;
    }

    // Trier les statistiques par date
    const sortedStats = [...pandemic.daily_stats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString();
      }),
      rates: sortedStats.map(stat => 
        stat.cases > 0 ? (stat.deaths / stat.cases) * 100 : 0
      ),
    };
  }, [pandemic.daily_stats]);

  // Données pour la carte géographique
  const geographicDistributionData = useMemo(() => {
    if (!pandemic.affected_locations || pandemic.affected_locations.length === 0) {
      return null;
    }

    // Regrouper par pays
    const countryMap = new Map<string, number>();
    
    pandemic.affected_locations.forEach(location => {
      const country = location.country;
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    return {
      labels: Array.from(countryMap.keys()),
      data: Array.from(countryMap.values()),
    };
  }, [pandemic.affected_locations]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Analyse détaillée: {pandemic.name}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nouveaux cas vs Récupérations */}
        {newCasesVsRecoveryData && (
          <ChartContainer
            type="line"
            title="Évolution des nouveaux cas et guérisons"
            data={{
              labels: newCasesVsRecoveryData.labels,
              datasets: [
                {
                  label: 'Nouveaux cas',
                  data: newCasesVsRecoveryData.newCases,
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.2,
                },
                {
                  label: 'Nouvelles guérisons',
                  data: newCasesVsRecoveryData.newRecoveries,
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.2,
                },
                {
                  label: 'Nouveaux décès',
                  data: newCasesVsRecoveryData.newDeaths,
                  borderColor: 'rgb(75, 85, 99)',
                  backgroundColor: 'rgba(75, 85, 99, 0.1)',
                  tension: 0.2,
                }
              ]
            }}
          />
        )}

        {/* Cas actifs vs Cas totaux */}
        {activeCasesData && (
          <ChartContainer
            type="line"
            title="Cas actifs vs Cas totaux"
            data={{
              labels: activeCasesData.labels,
              datasets: [
                {
                  label: 'Cas actifs',
                  data: activeCasesData.active,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.2,
                },
                {
                  label: 'Cas totaux',
                  data: activeCasesData.total,
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  tension: 0.2,
                }
              ]
            }}
          />
        )}

        {/* Taux de létalité */}
        {fatalityRateData && (
          <ChartContainer
            type="line"
            title="Évolution du taux de létalité (%)"
            data={{
              labels: fatalityRateData.labels,
              datasets: [
                {
                  label: 'Taux de létalité (%)',
                  data: fatalityRateData.rates,
                  borderColor: 'rgb(251, 113, 133)',
                  backgroundColor: 'rgba(251, 113, 133, 0.1)',
                  tension: 0.2,
                }
              ]
            }}
          />
        )}

        {/* Distribution géographique */}
        {geographicDistributionData && (
          <ChartContainer
            type="bar"
            title="Régions affectées"
            data={{
              labels: geographicDistributionData.labels,
              datasets: [
                {
                  label: 'Nombre de régions',
                  data: geographicDistributionData.data,
                  backgroundColor: 'rgba(45, 212, 191, 0.7)',
                }
              ]
            }}
          />
        )}
      </div>

      {/* Tableau des données quotidiennes */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques quotidiennes récentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cas Totaux</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cas Actifs</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nouveaux Cas</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Décès</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guérisons</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pandemic.daily_stats && pandemic.daily_stats.slice(0, 10).map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{new Date(stat.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.location.region || stat.location.country}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.cases.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.active.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.new_cases > 0 ? `+${stat.new_cases.toLocaleString()}` : '0'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.deaths.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{stat.recovered.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailedCharts; 