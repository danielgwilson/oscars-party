import { Suspense } from 'react';
import { Metadata } from 'next';
import GameView from '@/components/game/GameView';
import Loading from '@/components/game/Loading';

interface GamePageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'Oscars Party Game',
  description: 'Make your predictions and play trivia',
};

export default async function GamePage(props: GamePageProps) {
  const params = await props.params;
  const code = params.code;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex flex-col py-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-400">
          🎬 Oscars Party 🏆
        </h1>
        <p className="text-lg text-amber-200 mt-1">
          Game Code: <span className="font-bold tracking-widest">{code}</span>
        </p>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <Suspense fallback={<Loading />}>
          <GameView lobbyCode={code} />
        </Suspense>
      </div>
    </div>
  );
}
