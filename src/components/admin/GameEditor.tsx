import { useState } from "react";
import { GameVersion, Category, Question, MCQOption } from "@/types/game";
import { saveGame, resizeGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Grid3X3 } from "lucide-react";
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

      <div className="container mx-auto px-4 py-6">
        {/* Game Size Settings */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Game Size</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Categories:</label>
              <select
                value={game.categoryCount || 5}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value);
                  const resized = resizeGame(game, newCount, game.questionsPerCategory || 5);
                  setGame(resized);
                  if (selectedCategory >= newCount) setSelectedCategory(0);
                  toast.success(`Updated to ${newCount} categories`);
                }}
                className="bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Questions per category:</label>
              <select
                value={game.questionsPerCategory || 5}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value);
                  const resized = resizeGame(game, game.categoryCount || 5, newCount);
                  setGame(resized);
                  if (selectedQuestion >= newCount) setSelectedQuestion(0);
                  toast.success(`Updated to ${newCount} questions per category`);
                }}
                className="bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Grid: {game.categoryCount || 5} × {game.questionsPerCategory || 5} = {(game.categoryCount || 5) * (game.questionsPerCategory || 5)} cards
            </p>
          </div>
        </div>

        {/* Questions Editor */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentQuestion.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Context ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};