# Oscars Party App

A real-time multiplayer prediction game for the Academy Awards built with Next.js, Tailwind, shadcn/ui and Supabase.

## Features

- Create and join Oscar prediction games with a 4-letter lobby code
- Make predictions for Oscar categories before the show
- Real-time updates during the ceremony
- Points-based leaderboard
- Trivia rounds between award announcements

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/oscars-party.git
   cd oscars-party
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