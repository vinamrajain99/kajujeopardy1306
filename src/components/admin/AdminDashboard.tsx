import { useState, useEffect } from "react";
import { GameVersion } from "@/types/game";
import { getStoredGames, deleteGame, createEmptyGame, saveGame } from "@/lib/storage";
import { GameEditor } from "./GameEditor";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Play, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onPlayGame: (game: GameVersion) => void;
  onBack: () => void;
}

export const AdminDashboard = ({ onPlayGame, onBack }: AdminDashboardProps) => {
  const [games, setGames] = useState<GameVersion[]>([]);
  const [editingGame, setEditingGame] = useState<GameVersion | null>(null);

  useEffect(() => {
    setGames(getStoredGames());
  }, []);

  const handleCreateGame = () => {
    const name = prompt("Enter game name:");
    if (!name) return;
    const newGame = createEmptyGame(name);
    saveGame(newGame);
    setGames(getStoredGames());
    setEditingGame(newGame);
    toast.success("Game created!");
  };

  const handleDeleteGame = (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    deleteGame(gameId);
    setGames(getStoredGames());
    toast.success("Game deleted!");
  };

  const handleSaveGame = (game: GameVersion) => {
    setGames(getStoredGames());
  };

  if (editingGame) {
    return (
      <GameEditor
        game={editingGame}
        onBack={() => setEditingGame(null)}
        onSave={handleSaveGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-4xl text-gold">Admin Dashboard</h1>
          </div>
          <Button variant="gold" onClick={handleCreateGame}>
            <Plus className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </div>

        {/* Games List */}
        {games.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="font-display text-2xl text-foreground mb-4">
              No Games Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first Jeopardy game to get started!
            </p>
            <Button variant="gold" size="lg" onClick={handleCreateGame}>
              <Plus className="w-5 h-5 mr-2" />
              Create Game
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="glass rounded-xl p-6 flex items-center justify-between hover:glow-blue transition-all"
              >
                <div>
                  <h3 className="font-display text-2xl text-foreground">
                    {game.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingGame(game)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="gold"
                    onClick={() => onPlayGame(game)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGame(game.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
