import { Database } from '@/generated/supabase';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in the browser context.
 * This can be used in client components or in event handlers in server components.
 */
export const createClient = () => {
  // Added error handling to avoid crashes from failed network connection
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch (error) {
    console.error('Failed to create Supabase client:', error);

    // Return a simple mock client that will handle calls gracefully without crashing
    // This allows the app to load even if Supabase is temporarily unavailable
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { message: 'Supabase connection failed' },
            }),
            order: () => ({
              data: [],
              error: { message: 'Supabase connection failed' },
            }),
            data: [],
            error: { message: 'Supabase connection failed' },
          }),
          order: () => ({
            data: [],
            error: { message: 'Supabase connection failed' },
          }),
          data: [],
          error: { message: 'Supabase connection failed' },
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: { message: 'Supabase connection failed' },
            }),
          }),
          data: null,
          error: { message: 'Supabase connection failed' },
        }),
        update: () => ({
          eq: () => ({
            data: null,
            error: { message: 'Supabase connection failed' },
          }),
          data: null,
          error: { message: 'Supabase connection failed' },
        }),
        delete: () => ({
          eq: () => ({
            data: null,
            error: { message: 'Supabase connection failed' },
          }),
          data: null,
          error: { message: 'Supabase connection failed' },
        }),
        upsert: () => ({
          onConflict: () => ({
            data: null,
            error: { message: 'Supabase connection failed' },
          }),
          data: null,
          error: { message: 'Supabase connection failed' },
        }),
      }),
      channel: () => ({
        on: () => ({
          on: () => ({
            subscribe: () => {},
          }),
          subscribe: () => {},
        }),
      }),
      removeChannel: () => {},
    };
  }
};
