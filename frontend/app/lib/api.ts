import axios from 'axios';

// Détermine l'URL de l'API en fonction de l'environnement
const apiBaseUrl = 
  typeof window === 'undefined' 
  ? 'http://backend:8000'  // Côté serveur (SSR) utilise le nom du service Docker
  : process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'; // Côté client aussi

const api = axios.create({
  baseURL: apiBaseUrl,
});

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
  description?: string;
  active?: boolean;
}

export interface PandemicData {
  date: string;
  cases: number;
  deaths: number;
  recoveries: number;
}

export const apiClient = {
  // Get all pandemics
  getPandemics: async (): Promise<Pandemic[]> => {
    try {
      const response = await api.get('/api/v1/epidemics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch epidemics:', error);
      return [];
    }
  },

  // Get a specific pandemic by ID
  getPandemicById: async (id: string): Promise<Pandemic | null> => {
    try {
      const response = await api.get(`/api/v1/epidemics/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pandemic with id ${id}:`, error);
      return null;
    }
  },

  // Get pandemic data over time
  getPandemicData: async (id: string): Promise<PandemicData[]> => {
    try {
      const response = await api.get(`/api/v1/epidemics/${id}/data`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch data for pandemic ${id}:`, error);
      return [];
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
      return [];
    }
  },

  // Get pandemic statistics
  getPandemicStats: async (): Promise<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
  } | null> => {
    try {
      const response = await api.get('/api/v1/epidemics/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pandemic stats:', error);
      return null;
    }
  },
}; 