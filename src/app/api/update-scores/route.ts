import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { categoryId, nomineeId } = await request.json();

    if (!categoryId || !nomineeId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all correct predictions
    const { data: correctPredictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('player_id')
      .eq('category_id', categoryId)
      .eq('nominee_id', nomineeId);

    if (predictionsError) {
      throw new Error(`Failed to get predictions: ${predictionsError.message}`);
    }

    // Update scores for players with correct predictions
    for (const prediction of correctPredictions) {
      // First get the current score
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('score')
        .eq('id', prediction.player_id)
        .single();

      if (playerError) {
        console.error(`Failed to get player score: ${playerError.message}`);
        continue;
      }

      // Then update with the new score
      await supabase
        .from('players')
        .update({ score: (player.score || 0) + 10 })
        .eq('id', prediction.player_id);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Scores updated successfully',
        playersUpdated: correctPredictions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating scores:', error);
    return NextResponse.json(
      { error: 'Failed to update scores' },
      { status: 500 }
    );
  }
}
