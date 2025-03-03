/**
 * API utilities for the Oscars Party app
 */

/**
 * Creates a new game with the provided host name
 */
export async function createGame(hostName: string) {
  const response = await fetch('/api/create-game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hostName }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create game');
  }
  
  return response.json();
}

/**
 * Joins an existing game with the provided code and player name
 */
export async function joinGame(gameCode: string, playerName: string) {
  const response = await fetch('/api/join-game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gameCode, playerName }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to join game');
  }
  
  return response.json();
}

/**
 * Makes a prediction for a category
 */
export async function makePrediction(playerId: string, categoryId: string, nomineeId: string) {
  const response = await fetch('/api/make-prediction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, categoryId, nomineeId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save prediction');
  }
  
  return response.json();
}

/**
 * Locks a category so no further predictions can be made
 */
export async function lockCategory(categoryId: string) {
  const response = await fetch('/api/lock-category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoryId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to lock category');
  }
  
  return response.json();
}

/**
 * Sets a nominee as the winner for a category
 */
export async function setWinner(categoryId: string, nomineeId: string) {
  const response = await fetch('/api/set-winner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoryId, nomineeId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to set winner');
  }
  
  return response.json();
}