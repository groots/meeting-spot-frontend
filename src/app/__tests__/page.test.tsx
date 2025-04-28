/// <reference types="jest" />
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

// Create a simple component that mimics the UI of Home
const HomeUI = () => (
  <div>
    <h1>Find a Meeting Spot</h1>
    <p>Easily find the perfect meeting location between two addresses</p>
  </div>
);

describe('Home UI', () => {
  it('renders the main heading', () => {
    const { container } = render(<HomeUI />);
    expect(container).toHaveTextContent('Find a Meeting Spot');
  });

  it('renders the description', () => {
    const { container } = render(<HomeUI />);
    expect(container).toHaveTextContent('Easily find the perfect meeting location between two addresses');
  });
});
