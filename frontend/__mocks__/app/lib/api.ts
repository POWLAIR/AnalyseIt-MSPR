export const apiClient = {
  getDashboardStats: jest.fn().mockResolvedValue({
    items: [
      { label: "Cas Confirmés", value: 1000 },
      { label: "Décès", value: 100 }
    ],
    totalCases: 1000,
    totalDeaths: 100,
    growthRate: 1.5
  }),

  getPandemics: jest.fn().mockResolvedValue({
    items: [
      {
        id: 1,
        name: "Covid-19",
        type: "Virus",
        start_date: "2020-01-01"
      }
    ]
  }),

  getDailyStats: jest.fn().mockResolvedValue({ items: [] }),
  getLocations: jest.fn().mockResolvedValue({ items: [] }),
  getDataSources: jest.fn().mockResolvedValue({ items: [] })
}