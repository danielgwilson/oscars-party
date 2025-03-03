import { describe, it, expect } from 'vitest';
import { generateLobbyCode } from './utils';

describe('utils', () => {
  describe('generateLobbyCode', () => {
    it('should generate a 4-letter code', () => {
      const code = generateLobbyCode();
      expect(code).toHaveLength(4);
    });

    it('should only use allowed characters', () => {
      const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = generateLobbyCode();
      for (const char of code) {
        expect(allowedChars).toContain(char);
      }
    });

    it('should generate different codes on subsequent calls', () => {
      const code1 = generateLobbyCode();
      const code2 = generateLobbyCode();
      expect(code1).not.toEqual(code2);
    });
  });
});