import { useState } from "react";
import { GameVersion, HomeScreenImage } from "@/types/game";
import { getStoredGames, getGlobalSettings } from "@/lib/storage";
import { GameBoard } from "@/components/game/GameBoard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Play, Settings, Sparkles } from "lucide-react";

type View = "home" | "game" | "admin";

const IMAGE_EMOJIS: Record<HomeScreenImage, string> = {
  baby: '👶',
  stork: '🦢',
  rattle: '🎀',
  bottle: '🍼',
  footprints: '👣',
  heart: '💕',
  star: '⭐',
  balloon: '🎈',
  cake: '🎂',
  gift: '🎁',
};

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

  // Get global home screen settings
  const globalSettings = getGlobalSettings();
  const homeScreen = globalSettings.homeScreen;

  return (
    <div className="min-h-screen bg-background confetti-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow/10 rounded-full blur-3xl" />
      </div>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className="absolute top-20 left-20 w-5 h-5 text-yellow animate-pulse" />
        <Sparkles className="absolute top-32 right-32 w-4 h-4 text-pink animate-pulse" />
        <Sparkles className="absolute bottom-40 left-40 w-6 h-6 text-blue animate-pulse" />
        <Sparkles className="absolute bottom-20 right-20 w-5 h-5 text-mint animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-6 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-full baby-gradient flex items-center justify-center shadow-lg">
            <span className="text-2xl">{IMAGE_EMOJIS[homeScreen.image]}</span>
          </div>
        </div>

        {/* Heading */}
        {homeScreen.heading && (
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-primary mb-4 animate-fade-in leading-tight">
            {homeScreen.heading}
          </h1>
        )}

        {/* Subheading */}
        {homeScreen.subheading && (
          <p className="text-lg md:text-xl text-foreground/80 mb-3 animate-fade-in">
            {homeScreen.subheading}
          </p>
        )}

        {/* Tagline */}
        {homeScreen.tagline && (
          <p className="text-sm text-foreground/70 mb-3 animate-fade-in italic font-bold">
            {homeScreen.tagline}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 animate-fade-in mt-6">
          <Button
            variant="gold"
            size="lg"
            onClick={handleSelectGameToPlay}
            className="min-w-[180px] animate-pulse-glow"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Game
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("admin")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Index;