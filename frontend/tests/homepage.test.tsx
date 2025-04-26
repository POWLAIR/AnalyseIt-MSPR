import { render, screen, cleanup } from '@testing-library/react'
import HomePage from '../app/page'

// Nettoyage après chaque test
afterEach(() => {
  cleanup()
})

describe('HomePage', () => {
  it('affiche le titre "Fonctionnalités Principales"', () => {
    render(<HomePage />)
    expect(screen.getByText(/Fonctionnalités Principales/i)).toBeInTheDocument()
  })

  it('affiche la fonctionnalité "Surveillance en Temps Réel"', () => {
    render(<HomePage />)
    expect(screen.getByText(/Surveillance en Temps Réel/i)).toBeInTheDocument()
  })

  it('affiche la fonctionnalité "Analyses Détaillées"', () => {
    render(<HomePage />)
    expect(screen.getByText(/Analyses Détaillées/i)).toBeInTheDocument()
  })

  it('affiche la fonctionnalité "Couverture Mondiale"', () => {
    render(<HomePage />)
    expect(screen.getByText(/Couverture Mondiale/i)).toBeInTheDocument()
  })
})