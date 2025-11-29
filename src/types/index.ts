// Lobby represents a game session
export interface Lobby {
  id: string;
  code: string;
  host_id: string;
  created_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  current_question_id: string | null;
  game_stage: string | null;
  config: any | null;
}

// Player represents a user in a lobby
export interface Player {
  id: string;
  lobby_id: string | null;
  name: string;
  avatar_url: string | null;
  score: number | null;
  streak: number | null;
  correct_answers: number | null;
  incorrect_answers: number | null;
  is_host: boolean | null;
  created_at: string | null;
  has_been_roasted: boolean | null;
}

// Favorite Movies for a player
export interface FavoriteMovie {
  id: string;
  player_id: string | null;
  movie_title: string;
  tmdb_id: number | null;
  created_at: string | null;
}

// Movie data cached from TMDb
export interface Movie {
  id: string;
  tmdb_id: number | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
  director?: string | null;
  genres: string[] | null;
  data: any | null;
  created_at: string | null;
}

export interface Nominee {
  id: string;
  lobby_id?: string | null;
  category_id?: string | null;
  name: string;
  movie?: string | null;
  director?: string | null;
  country?: string | null;
  producers?: string[] | string | null;
  image_url?: string | null;
  is_winner?: boolean | null;
}

export interface CategoryWithNominees {
  id: string;
  lobby_id?: string | null;
  name: string;
  description?: string | null;
  locked?: boolean | null;
  order?: number | null;
  nominees: Nominee[];
}

export interface Category {
  id: string;
  lobby_id: string | null;
  name: string;
  description: string | null;
  locked: boolean | null;
  order: number | null;
  created_at: string | null;
}

export interface Prediction {
  id: string;
  player_id: string | null;
  category_id: string | null;
  nominee_id: string | null;
  created_at: string | null;
}

// Question represents a trivia question in the game
export interface Question {
  id: string;
  lobby_id: string | null;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  image_url: string | null;
  movie_id: string | null;
  difficulty: string | null;
  points: number | null;
  created_at: string | null;
}

// Answer represents a player's answer to a question
export interface Answer {
  id: string;
  player_id: string | null;
  question_id: string | null;
  answer: string;
  is_correct: boolean;
  answer_time: number;
  created_at: string | null;
}

// Roast represents an AI-generated roast for a player
export interface Roast {
  id: string;
  player_id: string | null;
  question_id: string | null;
  content: string;
  created_at: string | null;
}

// FinalBurn is the grand summary/roast at the end of a game
export interface FinalBurn {
  id: string;
  lobby_id: string | null;
  player_id: string | null;
  content: string;
  shame_list: string[];
  created_at: string | null;
}

// ChatMessage for emoji reactions
export interface ChatMessage {
  id: string;
  lobby_id: string | null;
  player_id: string | null;
  emoji: string;
  reaction: string | null;
  created_at: string | null;
}

// ShameList tracks movies players should watch
export interface ShameMovie {
  id: string;
  player_id: string | null;
  movie_title: string;
  tmdb_id: number | null;
  reason: string;
  created_at: string | null;
}

// Define fallback type definition for Supabase
export type Database = {
  public: {
    Tables: {
      lobbies: {
        Row: Lobby;
        Insert: Omit<Lobby, 'created_at'>;
        Update: Partial<Omit<Lobby, 'id' | 'created_at'>>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, 'created_at'>;
        Update: Partial<Omit<Player, 'id' | 'created_at'>>;
      };
      favorite_movies: {
        Row: FavoriteMovie;
        Insert: Omit<FavoriteMovie, 'id' | 'created_at'>;
        Update: Partial<Omit<FavoriteMovie, 'id' | 'created_at'>>;
      };
      movies: {
        Row: Movie;
        Insert: Omit<Movie, 'id' | 'created_at'>;
        Update: Partial<Omit<Movie, 'id' | 'created_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
      answers: {
        Row: Answer;
        Insert: Omit<Answer, 'id' | 'created_at'>;
        Update: Partial<Omit<Answer, 'id' | 'created_at'>>;
      };
      roasts: {
        Row: Roast;
        Insert: Omit<Roast, 'id' | 'created_at'>;
        Update: Partial<Omit<Roast, 'id' | 'created_at'>>;
      };
      final_burns: {
        Row: FinalBurn;
        Insert: Omit<FinalBurn, 'id' | 'created_at'>;
        Update: Partial<Omit<FinalBurn, 'id' | 'created_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>;
      };
      shame_movies: {
        Row: ShameMovie;
        Insert: Omit<ShameMovie, 'id' | 'created_at'>;
        Update: Partial<Omit<ShameMovie, 'id' | 'created_at'>>;
      };
    };
  };
};
