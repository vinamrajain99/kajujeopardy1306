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
  const [cardAnswers, setCardAnswers] = useState<Record<string, 1 | 2 | null>>({});
  const [currentQuestion, setCurrentQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
    isReview?: boolean;
  } | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [isEditingNames, setIsEditingNames] = useState(true);

  const handleCardSelect = (categoryIndex: number, questionIndex: number) => {
    setCurrentQuestion({ categoryIndex, questionIndex, isReview: false });
  };

  const handleReview = (categoryIndex: number, questionIndex: number) => {
    setCurrentQuestion({ categoryIndex, questionIndex, isReview: true });
  };

  const handleBack = () => {
    if (currentQuestion) {
      const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
      // Only mark as revealed if it was visited (not just reviewed)
      if (!currentQuestion.isReview) {
        setRevealedCards((prev) => new Set([...prev, cardId]));
      }
    }
    setCurrentQuestion(null);
  };

  const handleCorrect = (player: 1 | 2) => {
    if (!currentQuestion) return;
    const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
    const points =
      game.categories[currentQuestion.categoryIndex].questions[
        currentQuestion.questionIndex
      ].points;
    
    // If reviewing and changing answer, adjust scores
    const previousAnswer = cardAnswers[cardId];
    if (previousAnswer) {
      setScores((prev) => ({
        ...prev,
        [previousAnswer === 1 ? "player1" : "player2"]:
          prev[previousAnswer === 1 ? "player1" : "player2"] - points,
      }));
    }
    
    setCardAnswers((prev) => ({ ...prev, [cardId]: player }));
    setScores((prev) => ({
      ...prev,
      [player === 1 ? "player1" : "player2"]:
        prev[player === 1 ? "player1" : "player2"] + points,
    }));
    // Don't auto-navigate back - user must click "Back to Board"
  };

  const handleReset = () => {
    setRevealedCards(new Set());
    setCardAnswers({});
    setScores({ player1: 0, player2: 0 });
    setCurrentQuestion(null);
  };

  // Check if a card is "complete" (has an answer assigned)
  const isCardComplete = (cardId: string) => {
    return cardAnswers[cardId] !== undefined && cardAnswers[cardId] !== null;
  };

  if (isEditingNames) {
    return (
      <div className="min-h-screen bg-background confetti-bg flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-6 max-w-sm w-full animate-scale-in">
          <h1 className="font-display text-2xl text-primary text-center mb-6">
            {game.name}
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-medium">
                Player 1
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-medium">
                Player 2
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => setIsEditingNames(false)}
            >
              Start Game
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestion) {
    const category = game.categories[currentQuestion.categoryIndex];
    const question = category.questions[currentQuestion.questionIndex];
    const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
    return (
      <QuestionScreen
        question={question}
        categoryName={category.name}
        onBack={handleBack}
        onCorrect={handleCorrect}
        onWrong={handleBack}
        player1Name={player1Name}
        player2Name={player2Name}
        player1Score={scores.player1}
        player2Score={scores.player2}
        currentAnswer={cardAnswers[cardId]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background confetti-bg p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display text-xl md:text-2xl text-primary">
            {game.name}
          </h1>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center gap-3">
          <div className="glass rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">{player1Name}</p>
            <p className="font-display text-base text-pink">{scores.player1}</p>
          </div>
          <div className="glass rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">{player2Name}</p>
            <p className="font-display text-base text-blue">{scores.player2}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-3">
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
                  isComplete={isCardComplete(cardId)}
                  onSelect={() => handleCardSelect(colIndex, rowIndex)}
                  onReview={() => handleReview(colIndex, rowIndex)}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};