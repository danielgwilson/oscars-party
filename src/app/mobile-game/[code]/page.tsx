import { Suspense } from 'react';
import { Metadata } from 'next';
import MobileGameView from '@/components/game/MobileGameView';
import Loading from '@/components/game/Loading';

interface GamePageProps {
  params: Promise<{ code: string }>;
}

export const metadata: Metadata = {
  title: 'Movie Night Party',
  description: 'Make your predictions and play movie trivia',
};

export default async function MobileGamePage({ params }: GamePageProps) {
  const { code } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex flex-col items-center justify-center">
      <Suspense fallback={<Loading />}>
        <MobileGameView lobbyCode={code} />
      </Suspense>
    </div>
  );
}
