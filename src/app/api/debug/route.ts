import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const debugInfo: Record<string, any> = {};
    
    // Test database connection
    try {
      const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
      debugInfo.connectionTest = {
        success: !error,
        error: error ? error.message : null,
      };
    } catch (e) {
      debugInfo.connectionTest = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
    
    // Try to get DB schema
    try {
      const { data, error } = await supabase.rpc('get_schema');
      debugInfo.schema = {
        success: !error,
        data: data || null,
        error: error ? error.message : null,
      };
    } catch (e) {
      debugInfo.schema = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
    
    // Check if our tables exist
    const tables = ['lobbies', 'players', 'categories', 'nominees', 'predictions'];
    debugInfo.tables = {};
    
    for (const table of tables) {
      try {
        // Try to select just one row to see if the table exists
        const { data, error } = await supabase.from(table).select('*').limit(1);
        debugInfo.tables[table] = {
          exists: !error,
          error: error ? error.message : null,
        };
      } catch (e) {
        debugInfo.tables[table] = {
          exists: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }
    
    // Get environment info
    debugInfo.env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}