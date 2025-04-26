import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  // Fichiers à charger automatiquement après l’environnement Jest
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Environnement de test : simulateur de navigateur
  testEnvironment: 'jsdom',
  // Extensions de module à résoudre
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Mapper les imports personnalisés (si tu en as dans tsconfig.json)
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  // Optionnel : coverage ou transform
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

export default createJestConfig(customJestConfig)