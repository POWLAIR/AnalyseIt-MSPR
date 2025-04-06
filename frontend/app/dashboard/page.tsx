'use client';

import { useState, useEffect } from 'react';
import { apiClient, Pandemic } from '../lib/api';
import FilterPanel from '../components/FilterPanel';
import ChartContainer from '../components/ChartContainer';
import Card from '../components/Card';

interface FilterParams {
  country?: string;
  pandemicType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function Dashboard() {
  const [pandemics, setPandemics] = useState<Pandemic[]>([]);
  const [stats, setStats] = useState({
    totalPandemics: 0,
    activePandemics: 0,
    averageTransmissionRate: 0,
    averageMortalityRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pandemicsData, statsData] = await Promise.all([
        apiClient.getPandemics(),
        apiClient.getPandemicStats(),
      ]);
      setPandemics(pandemicsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters: FilterParams) => {
    try {
      const filteredData = await apiClient.getFilteredPandemics({
        country: filters.country,
        type: filters.pandemicType,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      });
      setPandemics(filteredData);
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord interactif</h1>

      {/* Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Pandémies totales"
          value={stats.totalPandemics}
          description="Nombre total de pandémies enregistrées"
        />
        <Card
          title="Pandémies actives"
          value={stats.activePandemics}
          description="Pandémies en cours actuellement"
        />
        <Card
          title="Taux de transmission moyen"
          value={`${stats.averageTransmissionRate.toFixed(2)}%`}
          description="Moyenne du taux de transmission"
        />
        <Card
          title="Taux de mortalité moyen"
          value={`${stats.averageMortalityRate.toFixed(2)}%`}
          description="Moyenne du taux de mortalité"
        />
      </div>

      {/* Filters and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
        <div className="lg:col-span-3 space-y-8">
          {/* Transmission Rate Chart */}
          <ChartContainer
            type="line"
            title="Taux de transmission par pandémie"
            data={{
              labels: pandemics.map((p) => p.name),
              datasets: [
                {
                  label: 'Taux de transmission (%)',
                  data: pandemics.map((p) => p.transmissionRate),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                },
              ],
            }}
          />

          {/* Mortality Rate Chart */}
          <ChartContainer
            type="bar"
            title="Taux de mortalité par pandémie"
            data={{
              labels: pandemics.map((p) => p.name),
              datasets: [
                {
                  label: 'Taux de mortalité (%)',
                  data: pandemics.map((p) => p.mortalityRate),
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
} 