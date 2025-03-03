// Lobby represents a game session
export interface Lobby {
  id: string;
  code: string;
  host_id: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

// Player represents a user in a lobby
export interface Player {
  id: string;
  lobby_id: string;
  name: string;
  avatar_url?: string;
  score: number;
  is_host: boolean;
  created_at: string;
}

// Category represents a prediction category (e.g., Best Picture)
export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  locked: boolean;
  lobby_id: string;
}

// Nominee represents an option in a category (e.g., a film nominated for Best Picture)
export interface Nominee {
  id: string;
  category_id: string;
  name: string;
  movie?: string;
  image_url?: string;
  director?: string;
  producers?: string[];
  country?: string;
  is_winner?: boolean;
}

// Prediction represents a player's prediction for a category
export interface Prediction {
  id: string;
  player_id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
  updated_at: string;
}

// TriviaQuestion represents a trivia question in the game
export interface TriviaQuestion {
  id: string;
  category_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  image_url?: string;
  points: number;
}

// TriviaAnswer represents a player's answer to a trivia question
export interface TriviaAnswer {
  id: string;
  player_id: string;
  trivia_id: string;
  answer: string;
  is_correct: boolean;
  answer_time: number; // milliseconds taken to answer
  created_at: string;
}

// Additional types for UI components
export interface CategoryWithNominees extends Category {
  nominees: Nominee[];
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
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      nominees: {
        Row: Nominee;
        Insert: Omit<Nominee, 'id'>;
        Update: Partial<Omit<Nominee, 'id'>>;
      };
      predictions: {
        Row: Prediction;
        Insert: Omit<Prediction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Prediction, 'id' | 'created_at' | 'updated_at'>>;
      };
      trivia_questions: {
        Row: TriviaQuestion;
        Insert: Omit<TriviaQuestion, 'id'>;
        Update: Partial<Omit<TriviaQuestion, 'id'>>;
      };
      trivia_answers: {
        Row: TriviaAnswer;
        Insert: Omit<TriviaAnswer, 'id' | 'created_at'>;
        Update: Partial<Omit<TriviaAnswer, 'id' | 'created_at'>>;
      };
    };
  };
};