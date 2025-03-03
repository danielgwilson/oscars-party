# 🎬 You Call Yourself a Movie Buff? 

An AI-powered movie trivia and roast game. Create multiplayer lobbies where players get mocked mercilessly by AI when they miss questions about movies they claim to love.

## Game Concept

This real-time multiplayer game uses AI to:
1. Generate trivia questions tailored to movies players actually know
2. Roast players with personalized insults when they get questions wrong
3. Deliver a grand final burn to the worst-performing player

## Features

- 🎮 **Instant Lobby System**: Join with a 4-letter code (Jackbox-style)
- 🎯 **Smart Trivia Engine**: AI tailors questions to what players actually know
- 🔥 **AI-Generated Roasts**: Hilarious mockery when players mess up
- 🏆 **Real-Time Scoring**: Live leaderboard with streaks and multipliers
- 📽️ **Movie Info & Insights**: AI shares fun facts about each featured film
- 😂 **Emoji React Chat**: Express reactions in real-time
- 📝 **The Shame List**: AI tracks movies players need to watch

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4 + Shadcn UI
- Supabase (real-time WebSockets + Postgres)
- Vercel Edge Functions
- Zustand
- OpenAI API
- TMDb API
- Wikipedia API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- OpenAI API key
- TMDb API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-buff-trivia.git
   cd movie-buff-trivia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   TMDB_API_KEY=your-tmdb-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

### End-to-End Tests

Run Playwright end-to-end tests:

```bash
# Install browsers (first time only)
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run tests with UI for debugging
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

## License

[MIT](LICENSE)