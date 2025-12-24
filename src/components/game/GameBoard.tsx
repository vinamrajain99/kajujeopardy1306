import { useState } from "react";
import { GameVersion } from "@/types/game";
import { GameCard } from "./GameCard";
import { CategoryHeader } from "./CategoryHeader";
import { QuestionScreen } from "./QuestionScreen";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface GameBoardProps {
  game: GameVersion;
  onExit: () => void;
}

export const GameBoard = ({ game, onExit }: GameBoardProps) => {
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
  } | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [isEditingNames, setIsEditingNames] = useState(true);

  const handleCardSelect = (categoryIndex: number, questionIndex: number) => {
    setCurrentQuestion({ categoryIndex, questionIndex });
  };

  const handleBack = () => {
    if (currentQuestion) {
      const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
      setRevealedCards((prev) => new Set([...prev, cardId]));
    }
    setCurrentQuestion(null);
  };

  const handleCorrect = (player: 1 | 2) => {
    if (!currentQuestion) return;
    const points =
      game.categories[currentQuestion.categoryIndex].questions[
        currentQuestion.questionIndex
      ].points;
    setScores((prev) => ({
      ...prev,
      [player === 1 ? "player1" : "player2"]:
        prev[player === 1 ? "player1" : "player2"] + points,
    }));
    handleBack();
  };

  const handleReset = () => {
    setRevealedCards(new Set());
    setScores({ player1: 0, player2: 0 });
    setCurrentQuestion(null);
  };

  if (isEditingNames) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full animate-scale-in">
          <h1 className="font-display text-4xl text-gold text-center mb-8">
            {game.name}
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Player 1 Name
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Player 2 Name
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={() => setIsEditingNames(false)}
            >
              Start Game
            </Button>
            <Button variant="outline" className="w-full" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestion) {
    const category = game.categories[currentQuestion.categoryIndex];
    const question = category.questions[currentQuestion.questionIndex];
    return (
      <QuestionScreen
        question={question}
        categoryName={category.name}
        onBack={handleBack}
        onCorrect={handleCorrect}
        onWrong={handleBack}
        player1Name={player1Name}
        player2Name={player2Name}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onExit}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-3xl md:text-4xl text-gold">
            {game.name}
          </h1>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center gap-6">
          <div className="glass rounded-xl px-6 py-3 text-center">
            <p className="text-sm text-muted-foreground">{player1Name}</p>
            <p className="font-display text-2xl text-gold">${scores.player1}</p>
          </div>
          <div className="glass rounded-xl px-6 py-3 text-center">
            <p className="text-sm text-muted-foreground">{player2Name}</p>
            <p className="font-display text-2xl text-gold">${scores.player2}</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-5 gap-3 md:gap-4">
        {/* Category Headers */}
        {game.categories.map((category) => (
          <CategoryHeader key={category.id} name={category.name} />
        ))}

        {/* Question Cards - rendered row by row */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <>
            {game.categories.map((category, colIndex) => {
              const question = category.questions[rowIndex];
              const cardId = `${colIndex}-${rowIndex}`;
              return (
                <GameCard
                  key={cardId}
                  question={question}
                  categoryIndex={colIndex}
                  questionIndex={rowIndex}
                  isRevealed={revealedCards.has(cardId)}
                  onSelect={() => handleCardSelect(colIndex, rowIndex)}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};
