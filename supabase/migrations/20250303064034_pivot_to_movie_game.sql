-- Pivot from Oscars Party to Movie Trivia Game

-- Alter lobbies table to add game-specific fields
ALTER TABLE public.lobbies ADD COLUMN IF NOT EXISTS game_stage TEXT DEFAULT 'lobby';
ALTER TABLE public.lobbies ADD COLUMN IF NOT EXISTS current_question_id UUID;
ALTER TABLE public.lobbies ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{"question_count": 10, "time_limit": 20}';

-- Alter players table to add movie trivia specific fields
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS incorrect_answers INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS has_been_roasted BOOLEAN DEFAULT false;

-- Drop Oscars-specific tables and create movie-specific ones
DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.predictions CASCADE; 
DROP TABLE IF EXISTS public.nominees CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Create movies table to cache data from TMDB
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  poster_path TEXT,
  release_date DATE,
  genres TEXT[],
  overview TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table (replacing trivia_questions)
DROP TABLE IF EXISTS public.trivia_questions CASCADE;
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  image_url TEXT,
  movie_id UUID,
  difficulty TEXT DEFAULT 'medium',
  points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update answers table (replacing trivia_answers)
DROP TABLE IF EXISTS public.trivia_answers CASCADE;
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answer_time INTEGER NOT NULL, -- milliseconds taken to answer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, question_id)
);

-- Create roasts table for incorrect answers
CREATE TABLE IF NOT EXISTS public.roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create final_burns table for end-of-game summaries
CREATE TABLE IF NOT EXISTS public.final_burns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  shame_list TEXT[] NOT NULL, -- movies they should watch
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create favorite_movies table
CREATE TABLE IF NOT EXISTS public.favorite_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  movie_title TEXT NOT NULL,
  tmdb_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shame_movies table
CREATE TABLE IF NOT EXISTS public.shame_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  movie_title TEXT NOT NULL,
  tmdb_id INTEGER,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update chat messages for emoji reactions
ALTER TABLE public.chat_messages DROP COLUMN IF EXISTS content;
ALTER TABLE public.chat_messages ADD COLUMN emoji TEXT NOT NULL;

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.movies, public.questions, public.answers, public.roasts, public.final_burns, public.favorite_movies, public.shame_movies;