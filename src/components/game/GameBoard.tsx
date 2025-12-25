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
    
    const previousAnswer = cardAnswers[cardId];
    
    // If clicking the same player, deselect (toggle off)
    if (previousAnswer === player) {
      setScores((prev) => ({
        ...prev,
        [player === 1 ? "player1" : "player2"]:
          prev[player === 1 ? "player1" : "player2"] - points,
      }));
      setCardAnswers((prev) => ({ ...prev, [cardId]: null }));
      return;
    }
    
    // If changing from one player to another, subtract from previous
    if (previousAnswer) {
      setScores((prev) => ({
        ...prev,
        [previousAnswer === 1 ? "player1" : "player2"]:
          prev[previousAnswer === 1 ? "player1" : "player2"] - points,
      }));
    }
    
    // Add points to new player
    setCardAnswers((prev) => ({ ...prev, [cardId]: player }));
    setScores((prev) => ({
      ...prev,
      [player === 1 ? "player1" : "player2"]:
        prev[player === 1 ? "player1" : "player2"] + points,
    }));
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

  // Calculate dynamic sizing based on grid dimensions
  const categoryCount = game.categoryCount || game.categories.length;
  const questionsPerCategory = game.questionsPerCategory || game.categories[0]?.questions.length || 5;
  
  // Calculate grid column class dynamically
  const getGridCols = () => {
    if (categoryCount <= 3) return 'grid-cols-3';
    if (categoryCount <= 4) return 'grid-cols-4';
    if (categoryCount <= 5) return 'grid-cols-5';
    if (categoryCount <= 6) return 'grid-cols-6';
    if (categoryCount <= 7) return 'grid-cols-7';
    return 'grid-cols-8';
  };

  // Calculate font size based on grid size
  const getTitleSize = () => {
    if (categoryCount >= 7) return 'text-sm md:text-base';
    if (categoryCount >= 6) return 'text-base md:text-lg';
    return 'text-xl md:text-2xl';
  };

  return (
    <div className="h-screen bg-background confetti-bg p-2 md:p-3 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExit}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className={`font-display ${getTitleSize()} text-primary`}>
            {game.name}
          </h1>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center gap-2">
          <div className="glass rounded-lg px-2 py-1 text-center">
            <p className="text-[9px] text-muted-foreground font-medium">{player1Name}</p>
            <p className="font-display text-sm text-pink">{scores.player1}</p>
          </div>
          <div className="glass rounded-lg px-2 py-1 text-center">
            <p className="text-[9px] text-muted-foreground font-medium">{player2Name}</p>
            <p className="font-display text-sm text-blue">{scores.player2}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Game Grid - fills remaining space */}
      <div 
        className={`grid ${getGridCols()} gap-1.5 md:gap-2 flex-1`}
        style={{
          gridTemplateRows: `auto repeat(${questionsPerCategory}, 1fr)`,
        }}
      >
        {/* Category Headers */}
        {game.categories.map((category) => (
          <CategoryHeader key={category.id} name={category.name} />
        ))}

        {/* Question Cards - rendered row by row */}
        {Array.from({ length: questionsPerCategory }).map((_, rowIndex) => (
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
                  compact={categoryCount >= 6 || questionsPerCategory >= 6}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};