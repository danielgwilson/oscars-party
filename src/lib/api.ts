/**
 * API utilities for the Movie Night Party app
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
 * Submits favorite movies for a player
 */
export async function submitFavoriteMovies(playerId: string, movies: string[]) {
  const response = await fetch('/api/submit-favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, movies }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save favorite movies');
  }
  
  return response.json();
}

/**
 * Generates trivia questions for a lobby
 */
export async function generateTrivia(lobbyId: string) {
  const response = await fetch('/api/trivia/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lobbyId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate trivia');
  }
  
  return response.json();
}

/**
 * Submits an answer to a trivia question
 */
export async function submitAnswer(playerId: string, questionId: string, answer: string, answerTime: number) {
  const response = await fetch('/api/submit-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, questionId, answer, answerTime }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit answer');
  }
  
  return response.json();
}

/**
 * Generates a roast for a wrong answer
 */
export async function generateRoast(playerId: string, questionId: string, playerName: string, 
                                    question: string, wrongAnswer: string, correctAnswer: string) {
  const response = await fetch('/api/roast/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      player_id: playerId, 
      question_id: questionId,
      player_name: playerName,
      question,
      wrong_answer: wrongAnswer,
      correct_answer: correctAnswer
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate roast');
  }
  
  return response.json();
}

/**
 * Generates a final burn for the lobby
 */
export async function generateFinalBurn(lobbyId: string) {
  const response = await fetch('/api/finalburn/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lobbyId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate final burn');
  }
  
  return response.json();
}