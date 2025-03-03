import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileTriviaView from '@/components/trivia/mobile-trivia-view';
import { Question, Movie, Roast } from '@/types';

// Mock data for testing
const mockQuestion: Question = {
  id: 'q-123',
  lobby_id: 'lobby-456',
  question: 'Which actor played Iron Man in the MCU?',
  options: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'],
  correct_answer: 'Robert Downey Jr.',
  difficulty: 'easy',
  points: 100,
  created_at: new Date().toISOString()
};

const mockMovie: Movie = {
  id: 'm-123',
  tmdb_id: 1234,
  title: 'Iron Man',
  poster_path: '/poster.jpg',
  director: 'Jon Favreau',
  genres: ['Action', 'Adventure', 'Sci-Fi'],
  created_at: new Date().toISOString()
};

const mockRoast: Roast = {
  id: 'r-123',
  player_id: 'player-123',
  question_id: 'q-123',
  content: "Wow, you don't know who played Iron Man? Next you'll tell me you think Star Wars is set in the future!",
  created_at: new Date().toISOString()
};

describe('MobileTriviaView', () => {
  it('should render question text', () => {
    render(
      <MobileTriviaView
        question={mockQuestion}
        onAnswer={() => {}}
        onNext={() => {}}
        currentQuestionNumber={1}
        totalQuestions={10}
        streak={0}
        playerName="TestPlayer"
      />
    );
    
    expect(screen.getByText('Which actor played Iron Man in the MCU?')).toBeInTheDocument();
  });
  
  it('should render answer options', () => {
    render(
      <MobileTriviaView
        question={mockQuestion}
        onAnswer={() => {}}
        onNext={() => {}}
        currentQuestionNumber={1}
        totalQuestions={10}
        streak={0}
        playerName="TestPlayer"
      />
    );
    
    expect(screen.getByText('Robert Downey Jr.')).toBeInTheDocument();
    expect(screen.getByText('Chris Evans')).toBeInTheDocument();
    expect(screen.getByText('Chris Hemsworth')).toBeInTheDocument();
    expect(screen.getByText('Mark Ruffalo')).toBeInTheDocument();
  });
  
  it('should call onAnswer when an option is clicked', () => {
    const onAnswerMock = vi.fn();
    
    render(
      <MobileTriviaView
        question={mockQuestion}
        onAnswer={onAnswerMock}
        onNext={() => {}}
        currentQuestionNumber={1}
        totalQuestions={10}
        streak={0}
        playerName="TestPlayer"
      />
    );
    
    fireEvent.click(screen.getByText('Robert Downey Jr.'));
    expect(onAnswerMock).toHaveBeenCalledWith('Robert Downey Jr.');
  });
  
  it('should show streak counter', () => {
    render(
      <MobileTriviaView
        question={mockQuestion}
        onAnswer={() => {}}
        onNext={() => {}}
        currentQuestionNumber={1}
        totalQuestions={10}
        streak={3}
        playerName="TestPlayer"
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  
  it('should show question progress indicator', () => {
    render(
      <MobileTriviaView
        question={mockQuestion}
        onAnswer={() => {}}
        onNext={() => {}}
        currentQuestionNumber={2}
        totalQuestions={5}
        streak={0}
        playerName="TestPlayer"
      />
    );
    
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
  });
});