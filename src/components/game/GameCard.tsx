import { Question } from "@/types/game";
import { Check, Eye } from "lucide-react";

interface GameCardProps {
  question: Question;
  categoryIndex: number;
  questionIndex: number;
  isRevealed: boolean;
  isComplete: boolean;
  onSelect: () => void;
  onReview?: () => void;
  compact?: boolean;
}

export const GameCard = ({
  question,
  isRevealed,
  isComplete,
  onSelect,
  onReview,
  compact = false,
}: GameCardProps) => {
  if (isRevealed) {
    return (
      <button
        onClick={onReview}
        className={`w-full h-full rounded-md flex flex-col items-center justify-center gap-0.5 transition-all group cursor-pointer ${
          isComplete 
            ? "bg-muted/40 border border-border/20 hover:bg-muted/60" 
            : "bg-yellow/20 border-2 border-dashed border-yellow/50 hover:bg-yellow/30"
        }`}
      >
        {isComplete ? (
          <>
            <Check className={compact ? "w-3 h-3" : "w-4 h-4"} />
            <Eye className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity`} />
          </>
        ) : (
          <>
            <Eye className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-yellow`} />
            <span className={`${compact ? "text-[7px]" : "text-[9px]"} text-yellow font-medium`}>Review</span>
          </>
        )}
      </button>
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