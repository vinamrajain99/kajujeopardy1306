import { useState, useEffect, useCallback } from "react";
import { GameVersion, GlobalSettings } from "@/types/game";
import { getGlobalSettings } from "@/lib/storage";
import { 
  getActiveSession, 
  createGameSession, 
  updateSessionProgress,
  GameSession 
} from "@/lib/gameSession";
import { supabase } from "@/integrations/supabase/client";
import { GameCard } from "./GameCard";
import { CategoryHeader } from "./CategoryHeader";
import { QuestionScreen } from "./QuestionScreen";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface GameBoardProps {
  game: GameVersion;
  onExit: () => void;
}

const PLAYER_COLORS = [
  'text-pink',
  'text-blue',
  'text-yellow',
  'text-mint',
  'text-lavender',
  'text-primary',
  'text-secondary',
  'text-accent',
  'text-success',
  'text-destructive',
];

const PLAYER_BG_COLORS = [
  'bg-pink hover:bg-pink/90',
  'bg-blue hover:bg-blue/90',
  'bg-yellow hover:bg-yellow/90',
  'bg-mint hover:bg-mint/90',
  'bg-lavender hover:bg-lavender/90',
  'bg-primary hover:bg-primary/90',
  'bg-secondary hover:bg-secondary/90',
  'bg-accent hover:bg-accent/90',
  'bg-success hover:bg-success/90',
  'bg-destructive hover:bg-destructive/90',
];

const defaultSettings: GlobalSettings = {
  homeScreenTexts: [],
  homeScreen: { heading: "Gender Reveal Jeopardy!", image: 'baby' },
  colorTheme: 'babyShower',
  timerEnabled: false,
  timerDuration: 30,
};

export const GameBoard = ({ game, onExit }: GameBoardProps) => {
  const playerCount = game.playerCount || 2;
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [cardAnswers, setCardAnswers] = useState<Record<string, number | null>>({});
  const [currentQuestion, setCurrentQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
    isReview?: boolean;
  } | null>(null);
  
  const [scores, setScores] = useState<number[]>(Array(playerCount).fill(0));
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`)
  );
  const [isEditingNames, setIsEditingNames] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing session or prepare for new one
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedSettings, existingSession] = await Promise.all([
          getGlobalSettings(),
          getActiveSession(game.id)
        ]);
        
        setSettings(loadedSettings);
        
        if (existingSession) {
          // Resume existing session
          setSession(existingSession);
          setPlayerNames(existingSession.playerNames);
          setScores(existingSession.scores);
          setRevealedCards(new Set(existingSession.revealedCards));
          setCardAnswers(existingSession.cardAnswers);
          setIsEditingNames(false);
          toast.info("Resuming previous game session");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [game.id]);

  // Real-time sync for session updates
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          const updated = payload.new as any;
          setScores(updated.scores || []);
          setRevealedCards(new Set(updated.revealed_cards || []));
          setCardAnswers(updated.card_answers || {});
          setPlayerNames(updated.player_names || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // Persist session changes
  const persistProgress = useCallback(async (updates: {
    scores?: number[];
    revealedCards?: string[];
    cardAnswers?: Record<string, number | null>;
    playerNames?: string[];
  }) => {
    if (!session?.id) return;
    await updateSessionProgress(session.id, updates);
  }, [session?.id]);

  const handleStartGame = async () => {
    // Create a new session
    const newSession = await createGameSession(game.id, playerNames, playerCount);
    if (newSession) {
      setSession(newSession);
      toast.success("Game session started!");
    }
    setIsEditingNames(false);
  };

  const handleCardSelect = (categoryIndex: number, questionIndex: number) => {
    setCurrentQuestion({ categoryIndex, questionIndex, isReview: false });
  };

  const handleReview = (categoryIndex: number, questionIndex: number) => {
    setCurrentQuestion({ categoryIndex, questionIndex, isReview: true });
  };

  const handleBack = async () => {
    if (currentQuestion) {
      const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
      if (!currentQuestion.isReview) {
        const newRevealed = new Set([...revealedCards, cardId]);
        setRevealedCards(newRevealed);
        await persistProgress({ revealedCards: Array.from(newRevealed) });
      }
    }
    setCurrentQuestion(null);
  };

  const handleCorrect = async (playerIndex: number) => {
    if (!currentQuestion) return;
    const cardId = `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`;
    const points =
      game.categories[currentQuestion.categoryIndex].questions[
        currentQuestion.questionIndex
      ].points;
    
    const previousAnswer = cardAnswers[cardId];
    
    let newScores = [...scores];
    let newCardAnswers = { ...cardAnswers };
    
    // If clicking the same player, deselect (toggle off)
    if (previousAnswer === playerIndex) {
      newScores[playerIndex] = newScores[playerIndex] - points;
      newCardAnswers[cardId] = null;
    } else {
      // If changing from one player to another, subtract from previous
      if (previousAnswer !== undefined && previousAnswer !== null) {
        newScores[previousAnswer] = newScores[previousAnswer] - points;
      }
      
      // Add points to new player
      newCardAnswers[cardId] = playerIndex;
      newScores[playerIndex] = newScores[playerIndex] + points;
    }
    
    setScores(newScores);
    setCardAnswers(newCardAnswers);
    
    // Persist changes
    await persistProgress({ scores: newScores, cardAnswers: newCardAnswers });
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the game? This will clear all progress.")) return;
    
    const newScores = Array(playerCount).fill(0);
    const newRevealed = new Set<string>();
    const newAnswers: Record<string, number | null> = {};
    
    setRevealedCards(newRevealed);
    setCardAnswers(newAnswers);
    setScores(newScores);
    setCurrentQuestion(null);
    
    await persistProgress({
      scores: newScores,
      revealedCards: [],
      cardAnswers: newAnswers
    });
    
    toast.success("Game reset!");
  };

  const handleResetCard = async (categoryIndex: number, questionIndex: number) => {
    const cardId = `${categoryIndex}-${questionIndex}`;
    
    // Remove from revealed cards
    const newRevealed = new Set(revealedCards);
    newRevealed.delete(cardId);
    
    // Remove answer and adjust score if needed
    const previousAnswer = cardAnswers[cardId];
    const newScores = [...scores];
    const newAnswers = { ...cardAnswers };
    
    if (previousAnswer !== undefined && previousAnswer !== null) {
      const points = game.categories[categoryIndex].questions[questionIndex].points;
      newScores[previousAnswer] -= points;
    }
    
    delete newAnswers[cardId];
    
    setRevealedCards(newRevealed);
    setCardAnswers(newAnswers);
    setScores(newScores);
    
    await persistProgress({
      scores: newScores,
      revealedCards: Array.from(newRevealed),
      cardAnswers: newAnswers
    });
    
    toast.success("Question reset!");
  };

  // Check if a card is "complete" (has an answer assigned)
  const isCardComplete = (cardId: string) => {
    return cardAnswers[cardId] !== undefined && cardAnswers[cardId] !== null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (isEditingNames) {
    return (
      <div className="min-h-screen bg-background confetti-bg flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-6 max-w-md w-full animate-scale-in">
          <h1 className="font-display text-2xl text-primary text-center mb-6">
            {game.name}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Enter names for {playerCount} players
          </p>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {playerNames.map((name, index) => (
              <div key={index}>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">
                  Player {index + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[index] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
            ))}
          </div>
          <Button
            variant="gold"
            size="lg"
            className="w-full mt-4"
            onClick={handleStartGame}
          >
            Start Game
          </Button>
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
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
        playerNames={playerNames}
        scores={scores}
        currentAnswer={cardAnswers[cardId] ?? null}
        playerColors={PLAYER_COLORS}
        playerBgColors={PLAYER_BG_COLORS}
        settings={settings}
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

        {/* Dynamic Scoreboard */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {playerNames.map((name, index) => (
            <div key={index} className="glass rounded-lg px-2 py-1 text-center">
              <p className="text-[9px] text-muted-foreground font-medium truncate max-w-[60px]">{name}</p>
              <p className={`font-display text-sm ${PLAYER_COLORS[index % PLAYER_COLORS.length]}`}>
                {scores[index]}
              </p>
            </div>
          ))}
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
                  onReset={() => handleResetCard(colIndex, rowIndex)}
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
