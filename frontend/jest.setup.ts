import React from 'react'
import '@testing-library/jest-dom'

// Mock canvas context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  }),
})

// Mock Chart.js and react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  __esModule: true,
  Line: () => React.createElement('div', { 'data-testid': 'mock-line-chart' }),
  Bar: () => React.createElement('div', { 'data-testid': 'mock-bar-chart' }),
  Doughnut: () => React.createElement('div', { 'data-testid': 'mock-doughnut-chart' }),
}))

jest.mock('chart.js/auto', () => ({}))
