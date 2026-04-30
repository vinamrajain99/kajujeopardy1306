import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { GameVersion } from "@/types/game";
import { getStoredGames } from "@/lib/storage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GameBoard } from "@/components/game/GameBoard";

const AdminPage = () => {
  const navigate = useNavigate();
  const [playingGame, setPlayingGame] = useState<GameVersion | null>(null);

  if (playingGame) {
    return <GameBoard game={playingGame} onExit={() => setPlayingGame(null)} />;
  }

  return (
    <AdminDashboard
      onPlayGame={(g) => setPlayingGame(g)}
      onBack={() => navigate("/")}
    />
  );
};

export default AdminPage;
