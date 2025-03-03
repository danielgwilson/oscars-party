'use client';

import dynamic from 'next/dynamic';

// Dynamic imports with no SSR to avoid hydration issues
const GameController = dynamic(
  () => import('@/components/trivia/game-controller'),
  { ssr: false }
);

const HostController = dynamic(
  () => import('@/components/trivia/host-controller'),
  { ssr: false }
);

import { Player } from '@/types';

interface ClientGameWrapperProps {
  isHost: boolean;
  lobbyId: string;
  lobbyCode: string;
  player: Player;
}

export default function ClientGameWrapper({
  isHost,
  lobbyId,
  lobbyCode,
  player,
}: ClientGameWrapperProps) {
  // Render host view or player view
  if (isHost) {
    return (
      <HostController lobbyId={lobbyId} lobbyCode={lobbyCode} player={player} />
    );
  }

  return <GameController lobbyId={lobbyId} player={player} />;
}
