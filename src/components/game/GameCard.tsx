import { Question } from "@/types/game";
import { Check, X, Eye, RotateCcw } from "lucide-react";

interface GameCardProps {
  question: Question;
  categoryIndex: number;
  questionIndex: number;
  isRevealed: boolean;
  isComplete: boolean;
  onSelect: () => void;
  onReview?: () => void;
  onReset?: () => void;
  compact?: boolean;
}

export const GameCard = ({
  question,
  isRevealed,
  isComplete,
  onSelect,
  onReview,
  onReset,
  compact = false,
}: GameCardProps) => {
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset?.();
  };

  if (isRevealed) {
    return (
      <div
        className={`w-full h-full rounded-md flex flex-col items-center justify-center gap-0.5 transition-all group cursor-pointer relative ${
          isComplete 
            ? "bg-success/20 border border-success/30 hover:bg-success/30" 
            : "bg-destructive/20 border border-destructive/30 hover:bg-destructive/30"
        }`}
        onClick={onReview}
      >
        {isComplete ? (
          <>
            <Check className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-success`} />
            <Eye className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity`} />
          </>
        ) : (
          <>
            <X className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-destructive`} />
            <Eye className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity`} />
          </>
        )}
        
        {/* Reset button - appears on hover */}
        <button
          onClick={handleReset}
          className={`absolute ${compact ? "top-0.5 right-0.5" : "top-1 right-1"} p-0.5 rounded bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity border border-border`}
          title="Reset this question"
        >
          <RotateCcw className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} text-muted-foreground`} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="flip-card w-full h-full cursor-pointer group"
    >
      <div className="flip-card-inner h-full">
        <div className="flip-card-front h-full card-gradient rounded-md flex items-center justify-center hover:border-primary hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <span className={`font-display ${compact ? "text-sm md:text-base" : "text-base md:text-lg lg:text-xl"} text-primary group-hover:scale-105 transition-transform`}>
            {question.points}
          </span>
        </div>
      </div>
    </button>
  );
};