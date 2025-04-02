/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText('Find a Meeting Spot')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Home />)
    expect(screen.getByText('Easily find the perfect meeting location between two addresses')).toBeInTheDocument()
  })
}) 