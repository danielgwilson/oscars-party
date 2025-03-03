import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGame, joinGame, makePrediction, lockCategory, setWinner } from './api';

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
  
  describe('makePrediction', () => {
    it('should make a POST request to /api/make-prediction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      await makePrediction('player-123', 'category-123', 'nominee-123');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/make-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          playerId: 'player-123',
          categoryId: 'category-123',
          nomineeId: 'nominee-123'
        }),
      });
    });
  });
});