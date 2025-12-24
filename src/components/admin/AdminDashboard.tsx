import { useState, useEffect } from "react";
import { GameVersion, HomeScreenText } from "@/types/game";
import { getStoredGames, deleteGame, createEmptyGame, saveGame, getGlobalSettings, saveGlobalSettings } from "@/lib/storage";
import { GameEditor } from "./GameEditor";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Play, ArrowLeft, Type, Save } from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onPlayGame: (game: GameVersion) => void;
  onBack: () => void;
}

export const AdminDashboard = ({ onPlayGame, onBack }: AdminDashboardProps) => {
  const [games, setGames] = useState<GameVersion[]>([]);
  const [editingGame, setEditingGame] = useState<GameVersion | null>(null);
  const [showHomeScreenEditor, setShowHomeScreenEditor] = useState(false);
  const [homeScreenTexts, setHomeScreenTexts] = useState<HomeScreenText[]>([]);

  useEffect(() => {
    setGames(getStoredGames());
    setHomeScreenTexts(getGlobalSettings().homeScreenTexts);
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

  const addHomeScreenText = (style: 'title' | 'subtitle' | 'tagline') => {
    const newText: HomeScreenText = {
      id: crypto.randomUUID(),
      text: style === 'title' ? 'New Title' : style === 'subtitle' ? 'New Subtitle' : 'New Tagline',
      style,
    };
    setHomeScreenTexts((prev) => [...prev, newText]);
  };

  const updateHomeScreenText = (id: string, text: string) => {
    setHomeScreenTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  const updateHomeScreenTextStyle = (id: string, style: 'title' | 'subtitle' | 'tagline') => {
    setHomeScreenTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, style } : t))
    );
  };

  const removeHomeScreenText = (id: string) => {
    setHomeScreenTexts((prev) => prev.filter((t) => t.id !== id));
  };

  const saveHomeScreenSettings = () => {
    saveGlobalSettings({ homeScreenTexts });
    toast.success("Home screen settings saved!");
    setShowHomeScreenEditor(false);
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
              Customize the text displayed on the game's home screen. These settings apply to all games.
            </p>

            <div className="space-y-4 mb-6">
              {homeScreenTexts.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateHomeScreenText(item.id, e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                      value={item.style}
                      onChange={(e) => updateHomeScreenTextStyle(item.id, e.target.value as 'title' | 'subtitle' | 'tagline')}
                      className="bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="title">Title (Large)</option>
                      <option value="subtitle">Subtitle (Medium)</option>
                      <option value="tagline">Tagline (Small, Italic)</option>
                    </select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHomeScreenText(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              <Button variant="outline" size="sm" onClick={() => addHomeScreenText('title')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Title
              </Button>
              <Button variant="outline" size="sm" onClick={() => addHomeScreenText('subtitle')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subtitle
              </Button>
              <Button variant="outline" size="sm" onClick={() => addHomeScreenText('tagline')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tagline
              </Button>
            </div>

            <Button variant="gold" onClick={saveHomeScreenSettings}>
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
          <div className="flex items-center gap-2">
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