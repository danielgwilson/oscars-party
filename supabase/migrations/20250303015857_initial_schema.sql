-- Create tables for the Oscars Party app

-- Lobbies table to store game sessions
CREATE TABLE IF NOT EXISTS public.lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Players table to store participants
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories table for award categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  locked BOOLEAN DEFAULT false
);

-- Nominees table for award nominees
CREATE TABLE IF NOT EXISTS public.nominees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  movie TEXT,
  image_url TEXT,
  director TEXT,
  producers TEXT[],
  country TEXT,
  is_winner BOOLEAN DEFAULT false
);

-- Predictions table for player predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, category_id)
);

-- Trivia questions table
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT
);

-- Trivia answers table
CREATE TABLE IF NOT EXISTS public.trivia_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  trivia_id UUID REFERENCES public.trivia_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answer_time INTEGER NOT NULL, -- milliseconds taken to answer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, trivia_id)
);

-- AI-generated insights for nominees
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat messages for lobby
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a function to increment player scores
CREATE OR REPLACE FUNCTION public.increment_player_score(p_player_id UUID, p_score INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.players
  SET score = score + p_score
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies, public.players, public.categories, public.nominees, public.predictions, public.trivia_questions, public.trivia_answers, public.ai_insights, public.chat_messages;