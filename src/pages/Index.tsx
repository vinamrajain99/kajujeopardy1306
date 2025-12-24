import { useState } from "react";
import { GameVersion } from "@/types/game";
import { getStoredGames } from "@/lib/storage";
import { GameBoard } from "@/components/game/GameBoard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Play, Settings, Sparkles } from "lucide-react";

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

  // Get the first game's home screen texts or use defaults
  const games = getStoredGames();
  const currentGame = games.length > 0 ? games[0] : null;
  const homeTexts = currentGame?.homeScreenTexts || [
    { id: "1", text: "Gender Reveal Jeopardy!", style: "title" as const },
    { id: "2", text: "The ultimate baby shower game", style: "subtitle" as const },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow/10 rounded-full blur-3xl" />
      </div>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className="absolute top-20 left-20 w-8 h-8 text-yellow animate-pulse" />
        <Sparkles className="absolute top-32 right-32 w-6 h-6 text-pink animate-pulse" />
        <Sparkles className="absolute bottom-40 left-40 w-10 h-10 text-blue animate-pulse" />
        <Sparkles className="absolute bottom-20 right-20 w-8 h-8 text-mint animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 animate-scale-in">
          <div className="w-24 h-24 mx-auto rounded-full baby-gradient flex items-center justify-center shadow-2xl glow-primary">
            <span className="text-4xl">👶</span>
          </div>
        </div>

        {/* Dynamic Home Screen Texts */}
        {homeTexts.map((item) => {
          if (item.style === 'title') {
            return (
              <h1 key={item.id} className="font-display text-5xl md:text-7xl text-primary text-shadow-glow mb-4 animate-fade-in">
                {item.text}
              </h1>
            );
          } else if (item.style === 'subtitle') {
            return (
              <p key={item.id} className="text-xl text-muted-foreground mb-8 animate-fade-in">
                {item.text}
              </p>
            );
          } else {
            return (
              <p key={item.id} className="text-lg text-foreground/80 mb-4 animate-fade-in italic">
                {item.text}
              </p>
            );
          }
        })}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in mt-8">
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