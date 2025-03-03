import { Metadata } from 'next';
import LobbyView from '@/components/lobby/LobbyView';

interface LobbyPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'Movie Night Party Lobby',
  description: 'Join the lobby and wait for the movie night to start',
};

export default async function LobbyPage(props: LobbyPageProps) {
  const params = await props.params;
  const code = params.code;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-amber-400">
          🎬 Movie Night Party 🏆
        </h1>
        <p className="text-xl text-amber-200 mt-2">Lobby</p>
      </div>

      <div className="w-full max-w-4xl">
        <LobbyView lobbyCode={code} />
      </div>
    </div>
  );
}
