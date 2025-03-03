import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Next.js components may need more complex mocking, but for simple tests:
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: (props: any) => <a {...props}>{props.children}</a>,
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('🎬 Oscars Party 🏆')).toBeInTheDocument();
  });

  it('renders the host and join options', () => {
    render(<Home />);
    expect(screen.getByText('Host a Party')).toBeInTheDocument();
    expect(screen.getByText('Join a Party')).toBeInTheDocument();
  });

  it('renders the how it works section', () => {
    render(<Home />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('1. Predict Winners')).toBeInTheDocument();
    expect(screen.getByText('2. Play Trivia')).toBeInTheDocument();
    expect(screen.getByText('3. Win Prizes')).toBeInTheDocument();
  });
});