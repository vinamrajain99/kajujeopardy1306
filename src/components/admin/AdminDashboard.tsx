import { useState, useEffect } from "react";
import { GameVersion, HomeScreenSettings, HomeScreenImage, ColorTheme } from "@/types/game";
import { getStoredGames, deleteGame, createEmptyGame, saveGame, getGlobalSettings, saveGlobalSettings } from "@/lib/storage";
import { GameEditor } from "./GameEditor";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Play, ArrowLeft, Type, Save, Palette, Timer } from "lucide-react";
import { toast } from "sonner";

const COLOR_THEMES: { id: ColorTheme; name: string; colors: string[] }[] = [
  { id: 'babyShower', name: 'Baby Shower', colors: ['#FFB6C1', '#87CEEB', '#FFFACD', '#98FB98', '#E6E6FA'] },
  { id: 'ocean', name: 'Ocean Breeze', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'] },
  { id: 'sunset', name: 'Sunset Glow', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#FF8C42', '#C44536'] },
  { id: 'forest', name: 'Forest Green', colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'] },
  { id: 'royal', name: 'Royal Purple', colors: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#E0AAFF', '#5A189A'] },
];

interface AdminDashboardProps {
  onPlayGame: (game: GameVersion) => void;
  onBack: () => void;
}

const HOME_SCREEN_IMAGES: { id: HomeScreenImage; emoji: string; name: string }[] = [
  { id: 'baby', emoji: '👶', name: 'Baby' },
  { id: 'stork', emoji: '🦢', name: 'Stork' },
  { id: 'rattle', emoji: '🎀', name: 'Rattle' },
  { id: 'bottle', emoji: '🍼', name: 'Bottle' },
  { id: 'footprints', emoji: '👣', name: 'Footprints' },
  { id: 'heart', emoji: '💕', name: 'Heart' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon' },
  { id: 'cake', emoji: '🎂', name: 'Cake' },
  { id: 'gift', emoji: '🎁', name: 'Gift' },
];

export const AdminDashboard = ({ onPlayGame, onBack }: AdminDashboardProps) => {
  const [games, setGames] = useState<GameVersion[]>([]);
  const [editingGame, setEditingGame] = useState<GameVersion | null>(null);
  const [showHomeScreenEditor, setShowHomeScreenEditor] = useState(false);
  const [homeScreen, setHomeScreen] = useState<HomeScreenSettings>({
    heading: "Gender Reveal Jeopardy!",
    image: 'baby',
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>('babyShower');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);

  useEffect(() => {
    setGames(getStoredGames());
    const settings = getGlobalSettings();
    setHomeScreen(settings.homeScreen);
    setColorTheme(settings.colorTheme);
    setTimerEnabled(settings.timerEnabled);
    setTimerDuration(settings.timerDuration);
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

  const saveHomeScreenSettings = () => {
    saveGlobalSettings({ 
      homeScreenTexts: [], 
      homeScreen, 
      colorTheme, 
      timerEnabled, 
      timerDuration 
    });
    toast.success("Home screen settings saved!");
    setShowHomeScreenEditor(false);
  };

  const handleTimerChange = (enabled: boolean, duration?: number) => {
    setTimerEnabled(enabled);
    if (duration !== undefined) setTimerDuration(duration);
    saveGlobalSettings({ 
      ...getGlobalSettings(), 
      timerEnabled: enabled, 
      timerDuration: duration ?? timerDuration 
    });
    toast.success(enabled ? `Timer set to ${duration ?? timerDuration}s` : "Timer disabled");
  };

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    saveGlobalSettings({ ...getGlobalSettings(), colorTheme: theme });
    applyColorTheme(theme);
    toast.success(`Theme changed to ${COLOR_THEMES.find(t => t.id === theme)?.name}!`);
  };

  const applyColorTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    switch (theme) {
      case 'babyShower':
        root.style.setProperty('--pink', '350 80% 80%');
        root.style.setProperty('--blue', '200 80% 70%');
        root.style.setProperty('--yellow', '50 95% 75%');
        root.style.setProperty('--mint', '150 60% 75%');
        root.style.setProperty('--lavender', '270 60% 85%');
        root.style.setProperty('--primary', '330 80% 55%');
        root.style.setProperty('--foreground', '340 20% 15%');
        break;
      case 'ocean':
        root.style.setProperty('--pink', '200 100% 40%');
        root.style.setProperty('--blue', '195 100% 45%');
        root.style.setProperty('--yellow', '195 80% 72%');
        root.style.setProperty('--mint', '195 60% 85%');
        root.style.setProperty('--lavender', '220 100% 25%');
        root.style.setProperty('--primary', '200 100% 40%');
        root.style.setProperty('--foreground', '200 50% 15%');
        break;
      case 'sunset':
        root.style.setProperty('--pink', '0 100% 71%');
        root.style.setProperty('--blue', '17 100% 73%');
        root.style.setProperty('--yellow', '48 100% 62%');
        root.style.setProperty('--mint', '24 100% 63%');
        root.style.setProperty('--lavender', '7 54% 49%');
        root.style.setProperty('--primary', '0 100% 65%');
        root.style.setProperty('--foreground', '15 50% 15%');
        break;
      case 'forest':
        root.style.setProperty('--pink', '153 50% 30%');
        root.style.setProperty('--blue', '153 40% 40%');
        root.style.setProperty('--yellow', '153 45% 50%');
        root.style.setProperty('--mint', '150 45% 60%');
        root.style.setProperty('--lavender', '150 40% 70%');
        root.style.setProperty('--primary', '153 50% 35%');
        root.style.setProperty('--foreground', '150 30% 15%');
        break;
      case 'royal':
        root.style.setProperty('--pink', '280 70% 46%');
        root.style.setProperty('--blue', '280 60% 58%');
        root.style.setProperty('--yellow', '280 50% 74%');
        root.style.setProperty('--mint', '280 45% 86%');
        root.style.setProperty('--lavender', '280 80% 32%');
        root.style.setProperty('--primary', '280 70% 50%');
        root.style.setProperty('--foreground', '280 30% 15%');
        break;
    }
  };

  // Apply theme on mount
  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  if (editingGame) {
    return (
      <GameEditor
        game={editingGame}
        onBack={() => setEditingGame(null)}
        onSave={handleSaveGame}
      />
    );
  }

  if (showHomeScreenEditor) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => setShowHomeScreenEditor(false)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-3xl text-primary">Home Screen Settings</h1>
          </div>

          <div className="glass rounded-xl p-6">
            <p className="text-muted-foreground mb-6 text-sm">
              Customize the text and image displayed on the game's home screen.
            </p>

            <div className="space-y-6">
              {/* Heading */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Heading (optional)
                </label>
                <input
                  type="text"
                  value={homeScreen.heading || ''}
                  onChange={(e) => setHomeScreen(prev => ({ ...prev, heading: e.target.value || undefined }))}
                  placeholder="Enter heading..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Subheading */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subheading (optional)
                </label>
                <input
                  type="text"
                  value={homeScreen.subheading || ''}
                  onChange={(e) => setHomeScreen(prev => ({ ...prev, subheading: e.target.value || undefined }))}
                  placeholder="Enter subheading..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tagline (optional)
                </label>
                <input
                  type="text"
                  value={homeScreen.tagline || ''}
                  onChange={(e) => setHomeScreen(prev => ({ ...prev, tagline: e.target.value || undefined }))}
                  placeholder="Enter tagline..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Home Screen Image
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {HOME_SCREEN_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setHomeScreen(prev => ({ ...prev, image: img.id }))}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        homeScreen.image === img.id
                          ? 'border-primary glow-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{img.emoji}</span>
                      <span className="text-xs text-muted-foreground">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="gold" onClick={saveHomeScreenSettings} className="mt-6">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
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
            <h1 className="font-display text-4xl text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowHomeScreenEditor(true)}>
              <Type className="w-4 h-4 mr-2" />
              Home Screen
            </Button>
            <Button variant="gold" onClick={handleCreateGame}>
              <Plus className="w-5 h-5 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        {/* Color Theme Selector */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Color Theme</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleColorThemeChange(theme.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  colorTheme === theme.id
                    ? 'border-primary glow-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-center">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Settings */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Question Timer</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => handleTimerChange(e.target.checked)}
                className="w-5 h-5 rounded border-border bg-input text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Enable countdown timer</span>
            </label>
            {timerEnabled && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Duration:</label>
                <select
                  value={timerDuration}
                  onChange={(e) => handleTimerChange(true, parseInt(e.target.value))}
                  className="bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[15, 20, 30, 45, 60, 90, 120].map((sec) => (
                    <option key={sec} value={sec}>{sec} seconds</option>
                  ))}
                </select>
              </div>
            )}
          </div>
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