import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createGame, 
  joinGame, 
  submitFavoriteMovies,
  generateTrivia,
  submitAnswer,
  generateRoast,
  generateFinalBurn
} from './api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });
  
  describe('createGame', () => {
    it('should make a POST request to /api/create-game', async () => {
      const mockResponse = { 
        lobbyId: 'test-lobby', 
        playerId: 'test-player',
        lobbyCode: 'ABCD' 
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await createGame('Test Host');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostName: 'Test Host' }),
      });
      
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error if the request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create game' }),
      });
      
      await expect(createGame('Test Host')).rejects.toThrow('Failed to create game');
    });
  });
  
  describe('joinGame', () => {
    it('should make a POST request to /api/join-game', async () => {
      const mockResponse = { 
        lobbyId: 'test-lobby', 
        playerId: 'test-player',
        lobbyCode: 'ABCD' 
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await joinGame('ABCD', 'Test Player');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameCode: 'ABCD', playerName: 'Test Player' }),
      });
      
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('submitFavoriteMovies', () => {
    it('should make a POST request to /api/submit-favorites', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      const movies = ['The Godfather', 'Pulp Fiction', 'The Dark Knight'];
      await submitFavoriteMovies('player-123', movies);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/submit-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          playerId: 'player-123',
          movies
        }),
      });
    });
  });
  
  describe('generateTrivia', () => {
    it('should make a POST request to /api/trivia/generate', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          questions: []
        }),
      });
      
      await generateTrivia('lobby-123');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/trivia/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId: 'lobby-123' }),
      });
    });
  });
  
  describe('submitAnswer', () => {
    it('should make a POST request to /api/submit-answer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      await submitAnswer('player-123', 'question-123', 'My Answer', 1500);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          playerId: 'player-123',
          questionId: 'question-123',
          answer: 'My Answer',
          answerTime: 1500
        }),
      });
    });
  });
  
  describe('generateRoast', () => {
    it('should make a POST request to /api/roast/generate', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          roast: { content: 'Funny roast' }
        }),
      });
      
      await generateRoast(
        'player-123', 
        'question-123', 
        'Test Player',
        'Who directed Pulp Fiction?',
        'Steven Spielberg',
        'Quentin Tarantino'
      );
      
      expect(mockFetch).toHaveBeenCalledWith('/api/roast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          player_id: 'player-123',
          question_id: 'question-123',
          player_name: 'Test Player',
          question: 'Who directed Pulp Fiction?',
          wrong_answer: 'Steven Spielberg',
          correct_answer: 'Quentin Tarantino'
        }),
      });
    });
  });
  
  describe('generateFinalBurn', () => {
    it('should make a POST request to /api/finalburn/generate', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          finalBurn: { content: 'Final burn content' }
        }),
      });
      
      await generateFinalBurn('lobby-123');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/finalburn/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId: 'lobby-123' }),
      });
    });
  });
});