import { createClient } from '@/utils/supabase/server';
import { generateLobbyCode } from './utils';
import { Lobby, Player, Category, Nominee, Prediction } from '@/types';
import nomineeData from '../../nominees.json';

// Creates a new lobby with a unique 4-letter code
export async function createLobby(hostId: string): Promise<string> {
  const supabase = await createClient();

  // Generate a unique 4-letter code
  let code = generateLobbyCode();
  let isUnique = false;

  while (!isUnique) {
    const { data } = await supabase
      .from('lobbies')
      .select('code')
      .eq('code', code)
      .single();

    if (!data) {
      isUnique = true;
    } else {
      code = generateLobbyCode();
    }
  }

  // Create the lobby
  const { data, error } = await supabase
    .from('lobbies')
    .insert({
      code,
      host_id: hostId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to create lobby');
  }

  // Seed the categories and nominees for this lobby
  await seedCategoriesAndNominees(data.id);

  return code;
}

// Joins an existing lobby
export async function joinLobby(
  code: string,
  playerName: string,
  avatarUrl?: string
): Promise<{ lobbyId: string; playerId: string }> {
  const supabase = await createClient();

  // Find the lobby
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('id')
    .eq('code', code)
    .single();

  if (lobbyError || !lobby) {
    throw new Error('Invalid lobby code');
  }

  // Create the player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      lobby_id: lobby.id,
      name: playerName,
      avatar_url: avatarUrl,
      score: 0,
      is_host: false,
    })
    .select()
    .single();

  if (playerError || !player) {
    throw new Error('Failed to join lobby');
  }

  return { lobbyId: lobby.id, playerId: player.id };
}

// Seeds the categories and nominees for a new lobby
async function seedCategoriesAndNominees(lobbyId: string): Promise<void> {
  const supabase = await createClient();

  // For each category in the nominees.json file
  for (const [categoryName, nominees] of Object.entries(nomineeData)) {
    // Create the category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        lobby_id: lobbyId,
        order: getOrderForCategory(categoryName),
        locked: false,
      })
      .select()
      .single();

    if (categoryError || !category) {
      console.error(
        `Failed to create category ${categoryName}:`,
        categoryError
      );
      continue;
    }

    // Create the nominees
    if (Array.isArray(nominees)) {
      for (const nominee of nominees) {
        if (typeof nominee === 'string') {
          // Simple string nominee (e.g., Best Picture)
          await supabase.from('nominees').insert({
            category_id: category.id,
            name: nominee,
          });
        } else {
          // Object nominee with additional data
          await supabase.from('nominees').insert({
            category_id: category.id,
            name:
              'name' in nominee
                ? nominee.name
                : 'title' in nominee
                ? nominee.title
                : '',
            movie: 'movie' in nominee ? nominee.movie : undefined,
            country: 'country' in nominee ? nominee.country : undefined,
            director:
              'director' in nominee
                ? nominee.director
                : 'directors' in nominee && nominee.directors
                ? nominee.directors.join(', ')
                : undefined,
            producers: 'producers' in nominee ? nominee.producers : undefined,
          });
        }
      }
    }
  }
}

// Get categories with nominees for a lobby
export async function getCategoriesWithNominees(lobbyId: string) {
  const supabase = await createClient();

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('lobby_id', lobbyId)
    .order('order');

  if (categoriesError || !categories) {
    throw new Error('Failed to get categories');
  }

  const result = [];

  for (const category of categories) {
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('*')
      .eq('category_id', category.id);

    if (nomineesError) {
      console.error(
        `Failed to get nominees for category ${category.name}:`,
        nomineesError
      );
      continue;
    }

    result.push({
      ...category,
      nominees: nominees || [],
    });
  }

  return result;
}

// Make a prediction
export async function makePrediction(
  playerId: string,
  categoryId: string,
  nomineeId: string
): Promise<void> {
  const supabase = await createClient();

  // Check if a prediction already exists
  const { data: existingPrediction } = await supabase
    .from('predictions')
    .select('id')
    .eq('player_id', playerId)
    .eq('category_id', categoryId)
    .single();

  if (existingPrediction) {
    // Update existing prediction
    await supabase
      .from('predictions')
      .update({
        nominee_id: nomineeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPrediction.id);
  } else {
    // Create new prediction
    await supabase.from('predictions').insert({
      player_id: playerId,
      category_id: categoryId,
      nominee_id: nomineeId,
    });
  }
}

// Get players in a lobby
export async function getLobbyPlayers(lobbyId: string): Promise<Player[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('lobby_id', lobbyId)
    .order('created_at');

  if (error) {
    throw new Error('Failed to get players');
  }

  return data || [];
}

// Get a specific order for each category to display them in a logical sequence
function getOrderForCategory(categoryName: string): number {
  const categoryOrder: Record<string, number> = {
    'Best Picture': 1,
    Directing: 2,
    'Actor in a Leading Role': 3,
    'Actress in a Leading Role': 4,
    'Actor in a Supporting Role': 5,
    'Actress in a Supporting Role': 6,
    'Animated Feature Film': 7,
    'International Feature Film': 8,
    'Documentary Feature Film': 9,
    Cinematography: 10,
  };

  return categoryOrder[categoryName] || 100; // Default to a high number for unknown categories
}

// Get a player by ID
export async function getPlayer(playerId: string): Promise<Player | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Get a lobby by code
export async function getLobbyByCode(code: string): Promise<Lobby | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Lock a category (when it's time to reveal the winner)
export async function lockCategory(categoryId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('categories')
    .update({ locked: true })
    .eq('id', categoryId);
}

// Set a nominee as the winner
export async function setWinner(nomineeId: string): Promise<void> {
  const supabase = await createClient();

  // Get the category ID for this nominee
  const { data: nominee, error: nomineeError } = await supabase
    .from('nominees')
    .select('category_id')
    .eq('id', nomineeId)
    .single();

  if (nomineeError || !nominee) {
    throw new Error('Nominee not found');
  }

  // Update all nominees in this category to not be winners
  await supabase
    .from('nominees')
    .update({ is_winner: false })
    .eq('category_id', nominee.category_id);

  // Set this nominee as the winner
  await supabase
    .from('nominees')
    .update({ is_winner: true })
    .eq('id', nomineeId);

  // Lock the category
  await lockCategory(nominee.category_id);

  // Update scores for all players with correct predictions
  await updateScores(nominee.category_id, nomineeId);
}

// Update scores for players with correct predictions
async function updateScores(
  categoryId: string,
  winningNomineeId: string
): Promise<void> {
  const supabase = await createClient();

  // Get all correct predictions
  const { data: correctPredictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('player_id')
    .eq('category_id', categoryId)
    .eq('nominee_id', winningNomineeId);

  if (predictionsError) {
    throw new Error('Failed to get predictions');
  }

  // Update scores for players with correct predictions
  for (const prediction of correctPredictions || []) {
    await supabase.rpc('increment_player_score', {
      p_player_id: prediction.player_id,
      p_score: 10, // Award 10 points for a correct prediction
    });
  }
}
