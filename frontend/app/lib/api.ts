import axios from 'axios';

// Détermine l'URL de l'API en fonction de l'environnement
const apiBaseUrl = 
  typeof window === 'undefined' 
  ? 'http://backend:8000'  // Côté serveur (SSR) utilise le nom du service Docker
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Côté client utilise localhost

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  response => response,
  error => {
    // Construction d'un message d'erreur plus détaillé
    let errorMessage = 'Erreur de communication avec le serveur';
    
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = error.response.status;
      const data = error.response.data || {};
      
      switch (status) {
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 422:
          errorMessage = 'Données invalides';
          if (data.detail) {
            if (Array.isArray(data.detail)) {
              errorMessage = `Validation échouée: ${data.detail.map((d: any) => d.msg).join(', ')}`;
            } else {
              errorMessage = `Validation échouée: ${data.detail}`;
            }
          }
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        default:
          errorMessage = `Erreur ${status}`;
          break;
      }
    } else if (error.request) {
      // La requête a été faite mais pas de réponse reçue
      errorMessage = 'Aucune réponse du serveur - vérifiez votre connexion réseau';
    }
    
    console.error('API Error:', errorMessage, error.message);
    return Promise.reject(new Error(errorMessage));
  }
);

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

export interface Location {
  id: number;
  country: string;
  region: string | null;
  iso_code: string | null;
}

export interface DailyStats {
  date: string;
  cases: number;
  active: number;
  deaths: number;
  recovered: number;
  new_cases: number;
  new_deaths: number;
  new_recovered: number;
  location: Location;
}

export interface OverallStats {
  total_cases: number;
  total_deaths: number;
  fatality_ratio: number;
}

export interface DetailedPandemic {
  id: number;
  name: string;
  type: string;
  country: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  transmission_rate: number;
  mortality_rate: number;
  total_cases: number;
  total_deaths: number;
  active: boolean;
  overall_stats: OverallStats;
  daily_stats: DailyStats[];
  affected_locations: Location[];
}

export interface DetailedPandemicResponse {
  epidemics: DetailedPandemic[];
  totalCount: number;
}

export interface FilterOptions {
  countries: string[];
  types: string[];
}

export interface FilterParams {
  country?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export const apiClient = {
  // Get all pandemics
  getPandemics: async (): Promise<Pandemic[]> => {
    try {
      const response = await api.get('/api/v1/epidemics');
      
      // Transformer les données du backend au format attendu par le frontend
      return response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        type: item.type || 'Non spécifié',
        country: item.country || 'Non spécifié',
        startDate: item.start_date,
        endDate: item.end_date,
        transmissionRate: item.transmission_rate || 0,
        mortalityRate: item.mortality_rate || 0,
        totalCases: item.total_cases || 0,
        totalDeaths: item.total_deaths || 0,
        description: item.description || '',
        active: item.end_date === null, // Une pandémie est active si elle n'a pas de date de fin
      }));
    } catch (error) {
      console.error('Failed to fetch epidemics:', error);
      return [];
    }
  },

  // Get a specific pandemic by ID
  getPandemicById: async (id: string): Promise<Pandemic | null> => {
    try {
      const response = await api.get(`/api/v1/epidemics/${id}`);
      const item = response.data;
      
      return {
        id: item.id.toString(),
        name: item.name,
        type: item.type || 'Non spécifié',
        country: item.country || 'Non spécifié',
        startDate: item.start_date,
        endDate: item.end_date,
        transmissionRate: item.transmission_rate || 0,
        mortalityRate: item.mortality_rate || 0,
        totalCases: item.total_cases || 0,
        totalDeaths: item.total_deaths || 0,
        description: item.description || '',
        active: item.end_date === null,
      };
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

  // Get filter options (countries, types)
  getFilterOptions: async (): Promise<FilterOptions> => {
    try {
      const response = await api.get('/api/v1/epidemics/filters');
      
      // Assurer que les listes sont triées
      const countries = response.data?.countries || [];
      const types = response.data?.types || [];
      
      return { 
        countries: countries.sort(), 
        types: types.sort() 
      };
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // En cas d'erreur, fournir un ensemble minimal d'options en attendant que le backend soit disponible
      return { 
        countries: ['France', 'États-Unis', 'Chine', 'Royaume-Uni', 'Japon'], 
        types: ['Viral', 'Bactérien', 'Parasitaire', 'Fongique'] 
      };
    }
  },

  // Get filtered pandemics
  getFilteredPandemics: async (filters: FilterParams): Promise<Pandemic[]> => {
    try {
      // Filtrer les paramètres vides ou undefined
      const cleanFilters: Record<string, string | boolean | undefined> = {};
      if (filters.country) cleanFilters.country = filters.country;
      if (filters.type) cleanFilters.type = filters.type;
      if (filters.startDate) cleanFilters.start_date = filters.startDate;
      if (filters.endDate) cleanFilters.end_date = filters.endDate;
      if (filters.active !== undefined) cleanFilters.active = filters.active;
      
      const response = await api.get('/api/v1/epidemics', { 
        params: cleanFilters
      });
      
      return response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        type: item.type || 'Non spécifié',
        country: item.country || 'Non spécifié',
        startDate: item.start_date,
        endDate: item.end_date,
        transmissionRate: item.transmission_rate || 0,
        mortalityRate: item.mortality_rate || 0,
        totalCases: item.total_cases || 0,
        totalDeaths: item.total_deaths || 0,
        description: item.description || '',
        active: item.end_date === null,
      }));
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

  // Get detailed epidemic data
  getDetailedData: async (
    skip: number = 0,
    limit: number = 20
  ): Promise<DetailedPandemicResponse> => {
    try {
      const response = await api.get('/api/v1/epidemics/detailed-data', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch detailed epidemic data:', error);
      return { epidemics: [], totalCount: 0 };
    }
  },
}; 