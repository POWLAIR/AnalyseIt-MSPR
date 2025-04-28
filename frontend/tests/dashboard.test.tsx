import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      },
      type_distribution: [
        { type: 'Virus', cases: 800, deaths: 80 },
        { type: 'Bactérie', cases: 200, deaths: 20 }
      ],
      geographic_distribution: [
        { country: 'France', cases: 500, deaths: 50 },
        { country: 'Allemagne', cases: 300, deaths: 30 },
        { country: 'Italie', cases: 200, deaths: 20 }
      ],
      daily_evolution: [
        { date: '2023-01-01', new_cases: 100, new_deaths: 10, active_cases: 90 },
        { date: '2023-01-02', new_cases: 150, new_deaths: 15, active_cases: 225 }
      ]
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
      ],
      page: 1,
      pages: 1,
      total: 1
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

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Vérifier les statistiques globales
    expect(screen.getByText('Cas totaux')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('Décès totaux')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('10.00%')).toBeInTheDocument()
  })

  it("affiche la pandémie 'Covid-19'", async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Vérifier que l'onglet Épidémies est présent
    const epidemicsTab = screen.getByRole('tab', { name: /Épidémies/i })
    expect(epidemicsTab).toBeInTheDocument()

    // Cliquer sur l'onglet Épidémies
    await user.click(epidemicsTab)

    // Vérifier que le tableau des épidémies est affiché
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Nom/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Type/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Pays/i })).toBeInTheDocument()
    })

    // Vérifier les informations de la pandémie
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Covid-19' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'France' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Virus' })).toBeInTheDocument()
    })
  })
})
