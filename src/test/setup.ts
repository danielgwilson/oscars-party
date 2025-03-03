import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Testing library jest-dom extends Vitest's expect method automatically

// Clean up after each test
afterEach(() => {
  cleanup();
});