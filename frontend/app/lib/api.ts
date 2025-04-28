import axios from "axios";

// Définition du type EventSource si non disponible dans l'environnement
declare global {
  interface WindowEventMap {
    message: MessageEvent;
    error: Event;
  }

  interface EventSource extends EventTarget {
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSED: 2;
    readonly readyState: number;
    onmessage: ((this: EventSource, ev: MessageEvent) => any) | null;
    onerror: ((this: EventSource, ev: Event) => any) | null;
    close(): void;
  }

  var EventSource: {
    prototype: EventSource;
    new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSED: 2;
  };
}

// Configuration de base d'Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "La requête a expiré. Le traitement des données prend plus de temps que prévu."
      );
      throw new Error(
        "Le traitement des données prend plus de temps que prévu. Veuillez réessayer."
      );
    }
    if (!error.response) {
      console.error("Erreur de connexion au serveur:", error.message);
      throw new Error(
        "Impossible de se connecter au serveur. Vérifiez votre connexion réseau."
      );
    }
    return Promise.reject(error);
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

export interface Localisation {
  id: number;
  country: string;
  region: string | null;
  iso_code: string | null;
}

export interface DataSource {
  id: number;
  source_type: string;
  reference: string;
  url: string;
}

export interface DailyStats {
  id: number;
  id_epidemic: number;
  id_source: number;
  id_loc: number;
  date: string;
  cases: number;
  active: number;
  deaths: number;
  recovered: number;
  new_cases: number;
  new_deaths: number;
  new_recovered: number;
  epidemic: Pandemic;
  location: Localisation;
  source: DataSource;
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
  affected_locations: Localisation[];
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

export type ProgressCallback = (data: {
  type: "download" | "processing";
  dataset?: string;
  filename?: string;
  progress?: number;
  currentRows?: number;
  totalRows?: number;
}) => void;

export interface DashboardStats {
  global_stats: {
    total_cases: number;
    total_deaths: number;
    total_epidemics: number;
    active_epidemics: number;
    mortality_rate: number;
  };
  type_distribution: Array<{
    type: string;
    cases: number;
    deaths: number;
  }>;
  geographic_distribution: Array<{
    country: string;
    cases: number;
    deaths: number;
  }>;
  daily_evolution: Array<{
    date: string;
    new_cases: number;
    new_deaths: number;
    active_cases: number;
  }>;
  top_active_epidemics: Array<{
    id: number;
    name: string;
    type: string;
    country: string;
    total_cases: number;
    total_deaths: number;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const apiClient = {
  // Get all pandemics with pagination
  getPandemics: async (
    page: number = 1,
    pageSize: number = 10,
    filters: {
      search?: string;
      type?: string;
      country?: string;
      sortBy?: string;
      sortDesc?: boolean;
    } = {}
  ): Promise<PaginatedResponse<Pandemic>> => {
    try {
      const response = await api.get("/api/v1/epidemics", {
        params: {
          skip: (page - 1) * pageSize,
          limit: pageSize,
          ...filters,
        },
      });

      return {
        items: response.data.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          type: item.type || "Non spécifié",
          country: item.country || "Non spécifié",
          startDate: item.start_date,
          endDate: item.end_date,
          transmissionRate: item.transmission_rate || 0,
          mortalityRate: item.mortality_rate || 0,
          totalCases: item.total_cases || 0,
          totalDeaths: item.total_deaths || 0,
          description: item.description || "",
          active: item.end_date === null,
        })),
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
      };
    } catch (error) {
      console.error("Failed to fetch epidemics:", error);
      return {
        items: [],
        total: 0,
        page: 1,
        pages: 1,
      };
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
        type: item.type || "Non spécifié",
        country: item.country || "Non spécifié",
        startDate: item.start_date,
        endDate: item.end_date,
        transmissionRate: item.transmission_rate || 0,
        mortalityRate: item.mortality_rate || 0,
        totalCases: item.total_cases || 0,
        totalDeaths: item.total_deaths || 0,
        description: item.description || "",
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
      const response = await api.get("/api/v1/epidemics/filters");

      // Assurer que les listes sont triées
      const countries = response.data?.countries || [];
      const types = response.data?.types || [];

      return {
        countries: countries.sort(),
        types: types.sort(),
      };
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      // En cas d'erreur, fournir un ensemble minimal d'options en attendant que le backend soit disponible
      return {
        countries: ["France", "États-Unis", "Chine", "Royaume-Uni", "Japon"],
        types: ["Viral", "Bactérien", "Parasitaire", "Fongique"],
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

      const response = await api.get("/api/v1/epidemics", {
        params: cleanFilters,
      });

      return response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        type: item.type || "Non spécifié",
        country: item.country || "Non spécifié",
        startDate: item.start_date,
        endDate: item.end_date,
        transmissionRate: item.transmission_rate || 0,
        mortalityRate: item.mortality_rate || 0,
        totalCases: item.total_cases || 0,
        totalDeaths: item.total_deaths || 0,
        description: item.description || "",
        active: item.end_date === null,
      }));
    } catch (error) {
      console.error("Failed to fetch filtered epidemics:", error);
      return [];
    }
  },

  // Get pandemic statistics
  getPandemicStats: async (): Promise<{
    totalPandemics: number;
    activePandemics: number;
    averageTransmissionRate: number;
    averageMortalityRate: number;
    latestStats: {
      cases: number;
      deaths: number;
      recovered: number;
      date: string;
    };
  } | null> => {
    try {
      const response = await api.get("/api/v1/stats/overview");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch pandemic stats:", error);
      return null;
    }
  },

  // Get detailed epidemic data
  getDetailedData: async (
    skip: number = 0,
    limit: number = 20
  ): Promise<DetailedPandemicResponse> => {
    try {
      const response = await api.get("/api/v1/epidemics/detailed-data", {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch detailed epidemic data:", error);
      return { epidemics: [], totalCount: 0 };
    }
  },

  // Initialize database
  initDatabase: async (
    reset: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    reset: boolean;
  }> => {
    try {
      const response = await api.post("/api/v1/admin/init-db", null, {
        params: { reset },
      });
      return {
        success: true,
        message:
          response.data.message || "Base de données initialisée avec succès",
        reset: reset,
      };
    } catch (error: any) {
      console.error("Failed to initialize database:", error);
      throw new Error(
        error.response?.data?.detail ||
          "Erreur lors de l'initialisation de la base de données"
      );
    }
  },

  // Run ETL process
  runETL: async (reset: boolean = false) => {
    try {
      // Lancement du processus ETL sans timeout
      const response = await api.post("/api/v1/admin/run-etl", null, {
        params: { reset },
        timeout: 0, // Désactive le timeout pour cette requête spécifique
      });

      return {
        success: true,
        message: response.data.message,
        details: response.data.details,
      };
    } catch (error: any) {
      console.error("Failed to run ETL process:", error);
      throw new Error(
        error.response?.data?.detail || "Erreur lors du processus ETL"
      );
    }
  },

  // Pandemic CRUD operations
  createEpidemic: async (data: Omit<Pandemic, "id">): Promise<Pandemic> => {
    const response = await api.post("/api/v1/epidemics", data);
    return response.data;
  },

  updateEpidemic: async (
    id: string,
    data: Partial<Pandemic>
  ): Promise<Pandemic> => {
    const response = await api.put(`/api/v1/epidemics/${id}`, data);
    return response.data;
  },

  deleteEpidemic: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/epidemics/${id}`);
  },

  // Daily Stats CRUD operations
  getDailyStats: async (): Promise<DailyStats[]> => {
    try {
      const response = await api.get("/api/v1/daily-stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch daily stats:", error);
      return [];
    }
  },

  createDailyStats: async (
    data: Omit<DailyStats, "id" | "epidemic" | "location" | "source">
  ): Promise<DailyStats> => {
    const response = await api.post("/api/v1/daily-stats", data);
    return response.data;
  },

  updateDailyStats: async (
    id: number,
    data: Partial<DailyStats>
  ): Promise<DailyStats> => {
    const response = await api.put(`/api/v1/daily-stats/${id}`, data);
    return response.data;
  },

  deleteDailyStats: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/daily-stats/${id}`);
  },

  // Location CRUD operations
  getLocations: async (): Promise<Localisation[]> => {
    const response = await api.get("/api/v1/locations");
    return response.data;
  },

  createLocation: async (
    data: Omit<Localisation, "id">
  ): Promise<Localisation> => {
    const response = await api.post("/api/v1/locations", data);
    return response.data;
  },

  updateLocation: async (
    id: number,
    data: Partial<Localisation>
  ): Promise<Localisation> => {
    const response = await api.put(`/api/v1/locations/${id}`, data);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/locations/${id}`);
  },

  // Data Source CRUD operations
  getDataSources: async (): Promise<DataSource[]> => {
    const response = await api.get("/api/v1/data-sources");
    return response.data;
  },

  createDataSource: async (
    data: Omit<DataSource, "id">
  ): Promise<DataSource> => {
    const response = await api.post("/api/v1/data-sources", data);
    return response.data;
  },

  updateDataSource: async (
    id: number,
    data: Partial<DataSource>
  ): Promise<DataSource> => {
    const response = await api.put(`/api/v1/data-sources/${id}`, data);
    return response.data;
  },

  deleteDataSource: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/data-sources/${id}`);
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/api/v1/stats/dashboard");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  },
};

export { api };
