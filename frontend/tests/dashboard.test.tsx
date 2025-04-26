import { render, screen, waitFor, cleanup } from '@testing-library/react'
import DashboardPage from '../app/dashboard/page'

// ✅ On injecte un mock explicite, parfaitement adapté à la structure utilisée dans Dashboard
jest.mock('../app/lib/api', () => ({
  apiClient: {
    getDashboardStats: jest.fn().mockResolvedValue({
      global_stats: {
        total_epidemics: 5,
        active_epidemics: 2,
        total_cases: 1000,
        total_deaths: 100,
        mortality_rate: 10.0
      }
    }),
    getPandemics: jest.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'Covid-19',
          type: 'Virus',
          country: 'France',
          startDate: '2020-01-01',
          endDate: null,
          totalCases: 1000000,
          totalDeaths: 10000,
          active: true
        }
      ]
    }),
    getDailyStats: jest.fn().mockResolvedValue({ items: [] }),
    getLocations: jest.fn().mockResolvedValue({ items: [] }),
    getDataSources: jest.fn().mockResolvedValue({ items: [] })
  }
}))

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('DashboardPage', () => {
  it("affiche les statistiques globales", async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Cas totaux/i)).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes("1000"))).toBeInTheDocument()
    })
  })

  it("affiche la pandémie 'Covid-19'", async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Covid-19/i)).toBeInTheDocument()
      expect(screen.getByText(/France/i)).toBeInTheDocument()
      expect(screen.getByText(/Virus/i)).toBeInTheDocument()
    })
  })
})
