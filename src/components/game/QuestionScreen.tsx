import { useState, useEffect, useRef } from "react";
import { Question, MCQOption } from "@/types/game";
import { getGlobalSettings } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, Check, X, Pause, Play } from "lucide-react";
import confetti from "canvas-confetti";

interface QuestionScreenProps {
  question: Question;
  categoryName: string;
  onBack: () => void;
  onCorrect: (player: 1 | 2) => void;
  onWrong: () => void;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  currentAnswer?: 1 | 2 | null;
}

export const QuestionScreen = ({
  question,
  categoryName,
  onBack,
  onCorrect,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  currentAnswer,
}: QuestionScreenProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<1 | 2 | null>(currentAnswer || null);
  
  // Timer state
  const settings = getGlobalSettings();
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (question.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % question.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [question.images.length]);

  // Timer effect
  useEffect(() => {
    if (!settings.timerEnabled || timerPaused || timeLeft <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.timerEnabled, timerPaused, timeLeft]);

  const handleOptionSelect = (index: number) => {
    if (!showAnswer) {
      setSelectedOption(index);
    }
  };

  const handlePlayerSelect = (player: 1 | 2) => {
    if (selectedPlayer === player) {
      setSelectedPlayer(null);
      onCorrect(player);
    } else {
      setSelectedPlayer(player);
      onCorrect(player);
    }
  };

  const handleRevealAnswer = () => {
    const newShowAnswer = !showAnswer;
    setShowAnswer(newShowAnswer);
    
    // Trigger confetti when revealing answer
    if (newShowAnswer) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB6C1', '#87CEEB', '#FFFACD', '#98FB98', '#E6E6FA'],
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-destructive';
    if (timeLeft <= 15) return 'text-yellow';
    return 'text-foreground';
  };

  return (
    <div className="min-h-screen bg-background confetti-bg p-4 md:p-6 flex flex-col">
      {/* Header with Scoreboard and Timer */}
      <div className="flex items-center justify-between gap-3 mb-4 animate-fade-in">
        <div>
          <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
            {categoryName}
          </span>
          <h2 className="font-display text-lg md:text-xl text-primary">
            {question.points} points
          </h2>
        </div>
        
        {/* Timer */}
        {settings.timerEnabled && (
          <div className="flex items-center gap-2">
            <div className={`glass rounded-lg px-3 py-1.5 text-center ${timeLeft <= 5 ? 'animate-pulse border-destructive border-2' : ''}`}>
              <p className="text-[10px] text-muted-foreground font-medium">Time</p>
              <p className={`font-display text-lg ${getTimerColor()}`}>{formatTime(timeLeft)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTimerPaused(!timerPaused)}
            >
              {timerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        )}
        
        {/* Scoreboard */}
        <div className="flex items-center gap-3">
          <div className="glass rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">{player1Name}</p>
            <p className="font-display text-base text-pink">{player1Score}</p>
          </div>
          <div className="glass rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">{player2Name}</p>
            <p className="font-display text-base text-blue">{player2Score}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col animate-slide-in-left">
        <div className="glass rounded-2xl p-5 md:p-6 flex-1 flex flex-col">
          {/* Question Text */}
          <h1 className="font-display text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-4">
            {question.text || "Question not configured"}
          </h1>

          {/* Context Image - Between question and options */}
          {question.images.length > 0 && (
            <div className="mb-4 animate-scale-in flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-center flex-1 min-h-0">
                <img
                  key={currentImageIndex}
                  src={question.images[currentImageIndex]}
                  alt="Question context"
                  className="max-w-full max-h-[55vh] w-auto h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
              {question.images.length > 1 && (
                <div className="flex justify-center gap-2 mt-3 shrink-0">
                  {question.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-primary scale-125"
                          : "bg-muted hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MCQ Options */}
          {question.isMCQ && question.options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
              {question.options.map((option: MCQOption, index: number) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col ${
                    selectedOption === index
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border hover:border-primary/50"
                  } ${
                    showAnswer && option.isCorrect
                      ? "border-success bg-success/20"
                      : ""
                  } ${
                    showAnswer &&
                    selectedOption === index &&
                    !option.isCorrect
                      ? "border-destructive bg-destructive/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center font-display text-sm text-secondary shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium flex-1">{option.text}</span>
                    {showAnswer && option.isCorrect && (
                      <Check className="w-4 h-4 text-success shrink-0" />
                    )}
                    {showAnswer &&
                      selectedOption === index &&
                      !option.isCorrect && (
                        <X className="w-4 h-4 text-destructive shrink-0" />
                      )}
                  </div>
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${String.fromCharCode(65 + index)}`}
                      className="mt-2 rounded-lg max-h-24 w-auto object-contain"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Answer Section */}
          {showAnswer && !question.isMCQ && (
            <div className="mt-4 p-4 rounded-xl bg-success/20 border-2 border-success animate-scale-in">
              <h3 className="font-display text-base text-success mb-1">
                Answer
              </h3>
              <p className="text-sm text-foreground">{question.answer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-border/30">
        <Button
          variant={selectedPlayer === 1 ? "default" : "outline"}
          size="default"
          onClick={() => handlePlayerSelect(1)}
          className={selectedPlayer === 1 ? "bg-pink hover:bg-pink/90" : ""}
        >
          {player1Name} {selectedPlayer === 1 && "✓"}
        </Button>
        <Button
          variant={selectedPlayer === 2 ? "default" : "outline"}
          size="default"
          onClick={() => handlePlayerSelect(2)}
          className={selectedPlayer === 2 ? "bg-blue hover:bg-blue/90" : ""}
        >
          {player2Name} {selectedPlayer === 2 && "✓"}
        </Button>

        <Button
          variant={showAnswer ? "outline" : "gold"}
          size="default"
          onClick={handleRevealAnswer}
        >
          {showAnswer ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Answer
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Reveal Answer
            </>
          )}
        </Button>

        <Button variant="outline" size="default" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Board
        </Button>
      </div>
    </div>
  );
};