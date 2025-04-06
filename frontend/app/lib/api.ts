import axios from 'axios';

// Détermine l'URL de l'API en fonction de l'environnement
const apiBaseUrl = 
  typeof window === 'undefined' 
  ? 'http://backend:8000'  // Côté serveur (SSR) utilise le nom du service Docker
  : process.env.NEXT_PUBLIC_API_URL; // Côté client utilise l'URL publique

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Mocks data pour le développement
const MOCK_PANDEMICS = [
  {
    id: "1",
    name: "COVID-19",
    type: "VIRAL",
    country: "CN",
    startDate: "2019-12-01",
    endDate: null,
    transmissionRate: 5.7,
    mortalityRate: 2.3,
    totalCases: 750000000,
    totalDeaths: 6900000
  },
  {
    id: "2",
    name: "Grippe Espagnole",
    type: "VIRAL",
    country: "ES",
    startDate: "1918-01-01",
    endDate: "1920-12-31",
    transmissionRate: 8.2,
    mortalityRate: 10.5,
    totalCases: 500000000,
    totalDeaths: 50000000
  },
  {
    id: "3",
    name: "Peste Noire",
    type: "BACTERIAL",
    country: "IT",
    startDate: "1347-01-01",
    endDate: "1352-12-31",
    transmissionRate: 9.5,
    mortalityRate: 30.0,
    totalCases: 75000000,
    totalDeaths: 20000000
  }
];

const MOCK_PANDEMIC_DATA = [
  { date: "2023-01-01", cases: 1000, deaths: 10 },
  { date: "2023-02-01", cases: 2000, deaths: 20 },
  { date: "2023-03-01", cases: 3000, deaths: 30 },
  { date: "2023-04-01", cases: 2500, deaths: 25 },
  { date: "2023-05-01", cases: 2000, deaths: 20 },
  { date: "2023-06-01", cases: 1500, deaths: 15 },
];

const MOCK_STATS = {
  totalPandemics: 12,
  activePandemics: 3,
  averageTransmissionRate: 6.8,
  averageMortalityRate: 4.2
};

export interface Pandemic {
  id: string;
  name: string;
  type: string;
  country: string;
  startDate: string;
  endDate?: string | null;
  transmissionRate: number;
  mortalityRate: number;
  totalCases: number;
  totalDeaths: number;
}

export interface PandemicData {
  date: string;
  cases: number;
  deaths: number;
}

export const apiClient = {
  // Get all pandemics
  getPandemics: async (): Promise<Pandemic[]> => {
    try {
      const response = await api.get('/api/v1/epidemics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch epidemics:', error);
      console.log('Using mock data for pandemics');
      return MOCK_PANDEMICS;
    }
  },

  // Get a specific pandemic by ID
  getPandemicById: async (id: string): Promise<Pandemic> => {
    try {
      const response = await api.get(`/api/v1/epidemics/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pandemic with id ${id}:`, error);
      console.log('Using mock data for pandemic detail');
      return MOCK_PANDEMICS.find(p => p.id === id) || MOCK_PANDEMICS[0];
    }
  },

  // Get pandemic data over time
  getPandemicData: async (id: string): Promise<PandemicData[]> => {
    try {
      const response = await api.get(`/api/v1/epidemics/${id}/data`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch data for pandemic ${id}:`, error);
      console.log('Using mock data for pandemic time series');
      return MOCK_PANDEMIC_DATA;
    }
  },

  // Get filtered pandemics
  getFilteredPandemics: async (filters: {
    country?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Pandemic[]> => {
    try {
      const response = await api.get('/api/v1/epidemics', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch filtered epidemics:', error);
      console.log('Using filtered mock data');
      // Filtrage basique sur les données de mock
      return MOCK_PANDEMICS.filter(p => {
        if (filters.country && p.country !== filters.country) return false;
        if (filters.type && p.type !== filters.type) return false;
        return true;
      });
    }
  },

  // Get pandemic statistics
  getPandemicStats: async (): Promise<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
  }> => {
    try {
      const response = await api.get('/api/v1/epidemics/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pandemic stats:', error);
      console.log('Using mock data for stats');
      return MOCK_STATS;
    }
  },
}; 