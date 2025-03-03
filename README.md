# Movie Night Party App

A real-time multiplayer prediction and trivia game for movie nights, film award shows, and franchise marathons, built with Next.js, Tailwind, shadcn/ui, and Supabase.

## Features

- Create and join movie prediction games with a 4-letter lobby code
- Make predictions about films, ratings, box office results, and more
- Real-time updates for all players
- Points-based leaderboard
- Trivia rounds for extra points

## Game Types

- Award Show Predictions (Oscars, Golden Globes, etc.)
- Movie Night Trivia
- Box Office Battle (predict earnings)
- Franchise Marathon (specific trivia for movie series)
- Critics' Corner (predict critics' ratings)
- Themed Movie Nights (horror, sci-fi, comedy, etc.)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-night-party.git
   cd movie-night-party
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