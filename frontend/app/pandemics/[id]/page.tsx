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

export default async function PandemicDetail({ 
  params 
}: PageProps) {
  const [pandemic, pandemicData] = await Promise.all([
    apiClient.getPandemicById(params.id),
    apiClient.getPandemicData(params.id),
  ]);

  if (!pandemic) {
    return <div className="text-center">Pandémie non trouvée</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">{pandemic.name}</h1>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
          {pandemic.type}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Pays" value={pandemic.country} description="Pays d'origine" />
        <Card
          title="Date de début"
          value={new Date(pandemic.startDate).toLocaleDateString()}
          description="Début de la pandémie"
        />
        <Card
          title="Taux de transmission"
          value={`${pandemic.transmissionRate.toFixed(2)}%`}
          description="Taux de transmission actuel"
        />
        <Card
          title="Taux de mortalité"
          value={`${pandemic.mortalityRate.toFixed(2)}%`}
          description="Taux de mortalité actuel"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer
          type="line"
          title="Évolution des cas"
          data={{
            labels: pandemicData.map((d: { date: string }) =>
              new Date(d.date).toLocaleDateString()
            ),
            datasets: [
              {
                label: 'Nombre de cas',
                data: pandemicData.map((d: { cases: number }) => d.cases),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              },
            ],
          }}
        />
        <ChartContainer
          type="line"
          title="Évolution des décès"
          data={{
            labels: pandemicData.map((d: { date: string }) =>
              new Date(d.date).toLocaleDateString()
            ),
            datasets: [
              {
                label: 'Nombre de décès',
                data: pandemicData.map((d: { deaths: number }) => d.deaths),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
              },
            ],
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Total des cas"
          value={pandemic.totalCases.toLocaleString()}
          description="Nombre total de cas enregistrés"
        />
        <Card
          title="Total des décès"
          value={pandemic.totalDeaths.toLocaleString()}
          description="Nombre total de décès enregistrés"
        />
      </div>
    </div>
  );
}
