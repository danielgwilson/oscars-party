# CLAUDE.md - Oscars Party App Guide

## Build Commands
- `npm run dev` - Start the development server with turbopack
- `npm run build` - Build the production app
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

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
- **Provide complete code** with clear file paths.
- **Use arrow functions** (`const fetchData = () => {}`) where possible.
- **Use named exports** (`export const ...`) instead of default exports.
- **Dash-case all filenames** (e.g., `user-profile.tsx`).
- **Favor functional programming** over OOP/classes.
- **Use `??` instead of `||`** for null checks.
- **No line numbers** in code snippets.
- **Follow `./spec.md`** if present.

## Next.js Best Practices
- **Use Next.js 15 App Router** (not pages router).
- **Prefer server actions over API routes** where possible.
- **Optimize loading**: Lazy load non-critical components.
- **Use Tailwind CSS & Shadcn UI** for styling.
- **React Hook Form + Zod** for form validation.
- **Minimize `useEffect`** by preferring server components.

## Tech Stack
Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, Vercel Edge, OpenAI API