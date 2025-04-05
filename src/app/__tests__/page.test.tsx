/// <reference types="jest" />
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock window object
const mockWindow = {
  location: {
    origin: 'http://localhost:3000',
  },
  navigator: {
    clipboard: {
      writeText: jest.fn(),
    },
  },
}

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText('Find a Meeting Spot')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Home />)
    expect(screen.getByText('Easily find the perfect meeting location between two addresses')).toBeInTheDocument()
  })
}) 