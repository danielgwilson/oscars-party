import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nomineeData from '../../../../nominees.json';

export async function POST(request: NextRequest) {
  try {
    const { lobbyId } = await request.json();

    if (!lobbyId) {
      return NextResponse.json(
        { error: 'Missing lobbyId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // For each category in the nominees.json file
    let categoryOrder = 1;
    for (const [categoryName, nominees] of Object.entries(nomineeData)) {
      // Create the category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert({
          lobby_id: lobbyId,
          name: categoryName,
          order: categoryOrder++,
          locked: false,
        })
        .select()
        .single();

      if (categoryError) {
        console.error(
          `Failed to create category ${categoryName}:`,
          categoryError
        );
        continue;
      }

      // Create the nominees
      if (Array.isArray(nominees)) {
        for (const nominee of nominees) {
          if (typeof nominee === 'string') {
            // Simple string nominee (e.g., Best Picture)
            await supabase.from('nominees').insert({
              category_id: category.id,
              name: nominee,
            });
          } else {
            // Object nominee with additional data
            await supabase.from('nominees').insert({
              category_id: category.id,
              name: 'name' in nominee ? nominee.name : nominee.title,
              movie: 'movie' in nominee ? nominee.movie : undefined,
              country: 'country' in nominee ? nominee.country : undefined,
              director:
                'director' in nominee
                  ? nominee.director
                  : 'directors' in nominee && nominee.directors
                  ? nominee.directors.join(', ')
                  : undefined,
              producers: 'producers' in nominee ? nominee.producers : undefined,
            });
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, message: 'Data seeded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
