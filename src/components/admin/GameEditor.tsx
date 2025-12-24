import { useState } from "react";
import { GameVersion, Category, Question, MCQOption, HomeScreenText } from "@/types/game";
import { saveGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";

interface GameEditorProps {
  game: GameVersion;
  onBack: () => void;
  onSave: (game: GameVersion) => void;
}

export const GameEditor = ({ game: initialGame, onBack, onSave }: GameEditorProps) => {
  const [game, setGame] = useState<GameVersion>(initialGame);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [activeTab, setActiveTab] = useState<'questions' | 'homescreen'>('questions');

  const currentCategory = game.categories[selectedCategory];
  const currentQuestion = currentCategory?.questions[selectedQuestion];

  const handleSave = () => {
    saveGame(game);
    onSave(game);
    toast.success("Game saved successfully!");
  };

  const updateCategoryName = (name: string) => {
    setGame((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === selectedCategory ? { ...cat, name } : cat
      ),
    }));
  };

  const updateQuestion = (updates: Partial<Question>) => {
    setGame((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, catIndex) =>
        catIndex === selectedCategory
          ? {
              ...cat,
              questions: cat.questions.map((q, qIndex) =>
                qIndex === selectedQuestion ? { ...q, ...updates } : q
              ),
            }
          : cat
      ),
    }));
  };

  const addMCQOption = () => {
    if (currentQuestion.options.length >= 4) return;
    const newOption: MCQOption = {
      id: crypto.randomUUID(),
      text: "",
    };
    updateQuestion({
      options: [...currentQuestion.options, newOption],
    });
  };

  const updateMCQOption = (optionIndex: number, updates: Partial<MCQOption>) => {
    updateQuestion({
      options: currentQuestion.options.map((opt, i) =>
        i === optionIndex ? { ...opt, ...updates } : opt
      ),
    });
  };

  const removeMCQOption = (optionIndex: number) => {
    updateQuestion({
      options: currentQuestion.options.filter((_, i) => i !== optionIndex),
    });
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      updateQuestion({
        images: [...currentQuestion.images, url],
      });
    }
  };

  const removeImage = (index: number) => {
    updateQuestion({
      images: currentQuestion.images.filter((_, i) => i !== index),
    });
  };

  // Home screen text management
  const homeScreenTexts = game.homeScreenTexts || [];

  const addHomeScreenText = (style: 'title' | 'subtitle' | 'tagline') => {
    const newText: HomeScreenText = {
      id: crypto.randomUUID(),
      text: style === 'title' ? 'New Title' : style === 'subtitle' ? 'New Subtitle' : 'New Tagline',
      style,
    };
    setGame((prev) => ({
      ...prev,
      homeScreenTexts: [...(prev.homeScreenTexts || []), newText],
    }));
  };

  const updateHomeScreenText = (id: string, text: string) => {
    setGame((prev) => ({
      ...prev,
      homeScreenTexts: (prev.homeScreenTexts || []).map((t) =>
        t.id === id ? { ...t, text } : t
      ),
    }));
  };

  const updateHomeScreenTextStyle = (id: string, style: 'title' | 'subtitle' | 'tagline') => {
    setGame((prev) => ({
      ...prev,
      homeScreenTexts: (prev.homeScreenTexts || []).map((t) =>
        t.id === id ? { ...t, style } : t
      ),
    }));
  };

  const removeHomeScreenText = (id: string) => {
    setGame((prev) => ({
      ...prev,
      homeScreenTexts: (prev.homeScreenTexts || []).filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <input
              type="text"
              value={game.name}
              onChange={(e) => setGame((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-transparent border-none font-display text-2xl text-primary focus:outline-none focus:ring-0"
            />
          </div>
          <Button variant="gold" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Game
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'questions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('questions')}
          >
            Questions & Categories
          </Button>
          <Button
            variant={activeTab === 'homescreen' ? 'default' : 'outline'}
            onClick={() => setActiveTab('homescreen')}
          >
            <Type className="w-4 h-4 mr-2" />
            Home Screen
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        {activeTab === 'homescreen' ? (
          /* Home Screen Editor */
          <div className="glass rounded-xl p-6">
            <h3 className="font-display text-2xl text-primary mb-6">Home Screen Text</h3>
            <p className="text-muted-foreground mb-6">
              Customize the text displayed on the game's home screen. Add titles, subtitles, and taglines.
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

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => addHomeScreenText('title')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Title
              </Button>
              <Button variant="outline" onClick={() => addHomeScreenText('subtitle')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subtitle
              </Button>
              <Button variant="outline" onClick={() => addHomeScreenText('tagline')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tagline
              </Button>
            </div>
          </div>
        ) : (
          /* Questions Editor */
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* Sidebar - Categories & Questions */}
            <div className="glass rounded-xl p-4 h-fit">
              <h3 className="font-display text-xl text-primary mb-4">Categories</h3>
              <div className="space-y-2">
                {game.categories.map((category, catIndex) => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(catIndex);
                        setSelectedQuestion(0);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === catIndex
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {category.name || `Category ${catIndex + 1}`}
                    </button>
                    {selectedCategory === catIndex && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.questions.map((q, qIndex) => (
                          <button
                            key={q.id}
                            onClick={() => setSelectedQuestion(qIndex)}
                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                              selectedQuestion === qIndex
                                ? "bg-secondary/20 text-secondary"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {q.points} pts - {q.text ? q.text.slice(0, 20) + "..." : "Empty"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Editor */}
            <div className="glass rounded-xl p-6">
              {/* Category Name */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={currentCategory?.name || ""}
                  onChange={(e) => updateCategoryName(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <hr className="border-border my-6" />

              {/* Question Editor */}
              <h3 className="font-display text-xl text-primary mb-4">
                Question ({currentQuestion?.points} points)
              </h3>

              <div className="space-y-6">
                {/* Points */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Point Value
                  </label>
                  <input
                    type="number"
                    value={currentQuestion?.points || 0}
                    onChange={(e) =>
                      updateQuestion({ points: parseInt(e.target.value) || 0 })
                    }
                    className="w-32 bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={currentQuestion?.text || ""}
                    onChange={(e) => updateQuestion({ text: e.target.value })}
                    rows={3}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Enter your question"
                  />
                </div>

                {/* MCQ Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isMCQ"
                    checked={currentQuestion?.isMCQ || false}
                    onChange={(e) =>
                      updateQuestion({
                        isMCQ: e.target.checked,
                        options: e.target.checked ? currentQuestion?.options || [] : [],
                      })
                    }
                    className="w-5 h-5 rounded border-border bg-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="isMCQ" className="text-foreground">
                    Multiple Choice Question
                  </label>
                </div>

                {/* MCQ Options */}
                {currentQuestion?.isMCQ && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-muted-foreground">
                        Options ({currentQuestion.options.length}/4)
                      </label>
                      {currentQuestion.options.length < 4 && (
                        <Button variant="outline" size="sm" onClick={addMCQOption}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      )}
                    </div>
                    {currentQuestion.options.map((option, index) => (
                      <div key={option.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-display text-sm shrink-0 mt-2 text-secondary-foreground">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateMCQOption(index, { text: e.target.value })
                            }
                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                          <input
                            type="text"
                            value={option.imageUrl || ""}
                            onChange={(e) =>
                              updateMCQOption(index, { imageUrl: e.target.value })
                            }
                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Image URL (optional)"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={option.isCorrect || false}
                            onChange={(e) =>
                              updateMCQOption(index, { isCorrect: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-border bg-input text-success focus:ring-success"
                          />
                          <span className="text-xs text-muted-foreground">Correct</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMCQOption(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer (for non-MCQ) */}
                {!currentQuestion?.isMCQ && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Answer
                    </label>
                    <textarea
                      value={currentQuestion?.answer || ""}
                      onChange={(e) => updateQuestion({ answer: e.target.value })}
                      rows={2}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Enter the correct answer"
                    />
                  </div>
                )}

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">
                      Context Images
                    </label>
                    <Button variant="outline" size="sm" onClick={addImage}>
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Add Image
                    </Button>
                  </div>
                  {currentQuestion?.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentQuestion.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Context ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};