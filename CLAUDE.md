# CLAUDE.md - Oscars Party App Guide

## Build Commands
- `npm run dev` - Start the development server with turbopack
- `npm run build` - Build the production app
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests in watch mode
- `npm run test:run` - Run Vitest tests once
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:report` - View Playwright test reports
- `npm run test:e2e:install` - Install Playwright browsers

## Code Style Guidelines
- **TypeScript**: Use strict types - interfaces for objects, explicit return types
- **Formatting**: Use Prettier with single quotes, trailing commas, 72 char width
- **Imports**: Use absolute imports with `@/` prefix (components, lib, utils, hooks, ui)
- **Components**: Follow shadcn/ui patterns with New York style
- **Error Handling**: Use try/catch with specific error types
- **State Management**: Prefer Zustand for global state
- **Naming**: PascalCase for components, camelCase for functions/variables
- **API Calls**: Handle loading/error states, use Edge Functions for external APIs
- **UI Components**: Leverage Tailwind/shadcn composition patterns
- **Real-time**: Use Supabase with proper RLS policies for data security

## General Coding
- **Use arrow functions** (`const fetchData = () => {}`) where possible
- **Use named exports** (`export const ...`) instead of default exports
- **Dash-case all filenames** (e.g., `user-profile.tsx`)
- **Favor functional programming** over OOP/classes
- **Use `??` instead of `||`** for null checks
- **Follow `./spec.md`** which contains the project requirements

## Project Structure
- `/src/app` - Next.js App Router pages
- `/src/components` - React components (UI, game, lobby, leaderboard)
- `/src/lib` - Utilities and shared functions
- `/src/utils/supabase` - Supabase client setup
- `/src/types` - TypeScript interface definitions
- `/src/test` - Test setup and utilities
- `/public` - Static assets
- `/supabase` - Supabase migrations and configuration

## Database Schema
- `lobbies` - Game sessions with 4-letter codes
- `players` - Participants in each lobby
- `categories` - Oscar award categories
- `nominees` - Nominees for each category
- `predictions` - Player predictions for categories
- `trivia_questions` - Game trivia questions
- `trivia_answers` - Player answers to trivia

## Testing
- Unit tests use Vitest and React Testing Library
- Run `npm run test` to start tests in watch mode
- Add new tests in `.test.tsx` files alongside components
- E2E tests use Playwright and are located in the `/e2e` directory
- Run `npm run test:e2e` to run all end-to-end tests
- Run `npm run test:e2e:ui` for visual debugging of tests

## Tech Stack
Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, Vercel Edge, OpenAI API