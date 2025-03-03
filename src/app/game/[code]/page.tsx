import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Loading from '@/components/game/Loading';
import { Database } from '@/types';
import { createClient } from '@/utils/supabase/server';
import ClientGameWrapper from '@/app/game/[code]/ClientGameWrapper';

// Dynamic imports moved to ClientGameWrapper.tsx

interface GamePageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ player_id?: string }>;
}

export const metadata: Metadata = {
  title: 'You Call Yourself a Movie Buff?',
  description:
    'Test your movie knowledge and get roasted for your terrible opinions',
};

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { code } = await params;
  const { player_id } = await searchParams;

  if (!player_id) {
    return redirect(`/join?code=${code}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex flex-col py-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-400">
          🎬 You Call Yourself a Movie Buff? 🔥
        </h1>
        <p className="text-lg text-amber-200 mt-1">
          Game Code:{' '}
          <span className="font-bold tracking-widest">
            {code.toUpperCase()}
          </span>
        </p>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <Suspense fallback={<Loading />}>
          <GameContent code={code} playerId={player_id} />
        </Suspense>
      </div>
    </div>
  );
}

async function GameContent({
  code,
  playerId,
}: {
  code: string;
  playerId: string;
}) {
  const supabase = await createClient();

  // Get the lobby by code
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (lobbyError || !lobby) {
    return redirect(`/join?error=invalid_code&code=${code}`);
  }

  // Get the player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .eq('lobby_id', lobby.id)
    .single();

  if (playerError || !player) {
    return redirect(`/join?error=invalid_player&code=${code}`);
  }

  // Render host view or player view using the client component wrapper
  return (
    <ClientGameWrapper
      isHost={player.is_host}
      lobbyId={lobby.id}
      lobbyCode={lobby.code}
      player={player}
    />
  );
}
