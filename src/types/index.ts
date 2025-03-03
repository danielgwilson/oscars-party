export interface Lobby {
  id: string;
  code: string;
  host_id: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface Player {
  id: string;
  lobby_id: string;
  name: string;
  avatar_url?: string;
  score: number;
  is_host: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  locked: boolean;
}

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

export interface Prediction {
  id: string;
  player_id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
  updated_at: string;
}

export interface TriviaQuestion {
  id: string;
  category_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export interface TriviaAnswer {
  id: string;
  player_id: string;
  trivia_id: string;
  answer: string;
  is_correct: boolean;
  answer_time: number; // milliseconds taken to answer
  created_at: string;
}

export interface AIInsight {
  id: string;
  nominee_id: string;
  content: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  lobby_id: string;
  player_id: string;
  content: string;
  reaction?: string;
  created_at: string;
}

export type NomineeWithInsight = Nominee & {
  insight?: AIInsight;
};

export type CategoryWithNominees = Category & {
  nominees: Nominee[];
};