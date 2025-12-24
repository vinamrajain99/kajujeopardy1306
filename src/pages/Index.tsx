import { useState } from "react";
import { GameVersion } from "@/types/game";
import { getStoredGames } from "@/lib/storage";
import { GameBoard } from "@/components/game/GameBoard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Play, Settings, Gamepad2 } from "lucide-react";

type View = "home" | "game" | "admin";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedGame, setSelectedGame] = useState<GameVersion | null>(null);

  const handlePlayGame = (game: GameVersion) => {
    setSelectedGame(game);
    setView("game");
  };

  const handleSelectGameToPlay = () => {
    const games = getStoredGames();
    if (games.length === 0) {
      setView("admin");
      return;
    }
    if (games.length === 1) {
      handlePlayGame(games[0]);
      return;
    }
    // Show game selection
    setView("admin");
  };

  if (view === "game" && selectedGame) {
    return (
      <GameBoard
        game={selectedGame}
        onExit={() => {
          setSelectedGame(null);
          setView("home");
        }}
      />
    );
  }

  if (view === "admin") {
    return (
      <AdminDashboard
        onPlayGame={handlePlayGame}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 animate-scale-in">
          <div className="w-24 h-24 mx-auto rounded-2xl gold-gradient flex items-center justify-center shadow-2xl glow-gold">
            <Gamepad2 className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-6xl md:text-8xl text-gold text-shadow-glow mb-4 animate-fade-in">
          JEOPARDY!
        </h1>
        <p className="text-xl text-muted-foreground mb-12 animate-fade-in">
          The ultimate trivia game experience
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Button
            variant="gold"
            size="xl"
            onClick={handleSelectGameToPlay}
            className="min-w-[200px] animate-pulse-glow"
          >
            <Play className="w-6 h-6 mr-2" />
            Play Game
          </Button>
          <Button
            variant="outline"
            size="xl"
            onClick={() => setView("admin")}
            className="min-w-[200px]"
          >
            <Settings className="w-6 h-6 mr-2" />
            Admin Panel
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 glass rounded-2xl p-6 inline-block animate-fade-in">
          <p className="text-sm text-muted-foreground">
            {getStoredGames().length === 0 ? (
              "No games configured yet. Head to Admin Panel to create one!"
            ) : (
              `${getStoredGames().length} game${
                getStoredGames().length > 1 ? "s" : ""
              } ready to play`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
