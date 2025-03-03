import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Next.js components may need more complex mocking, but for simple tests:
vi.mock('next/image', () => ({
  default: (props: {src: string; alt?: string; [key: string]: any}) => 
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />,
}));

vi.mock('next/link', () => ({
  default: (props: {href: string; children: React.ReactNode; [key: string]: any}) => 
    <a {...props}>{props.children}</a>,
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('🎬 You Call Yourself a Movie Buff? 🔥')).toBeInTheDocument();
  });

  it('renders the host and join options', () => {
    render(<Home />);
    expect(screen.getByText('Host a Game')).toBeInTheDocument();
    expect(screen.getByText('Join a Game')).toBeInTheDocument();
  });

  it('renders the how it works section', () => {
    render(<Home />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('1. Share Your Faves')).toBeInTheDocument();
    expect(screen.getByText('2. Answer Trivia')).toBeInTheDocument();
    expect(screen.getByText('3. Get Roasted')).toBeInTheDocument();
  });
});