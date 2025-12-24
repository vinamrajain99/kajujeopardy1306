import { Question } from "@/types/game";
import { Check, Eye } from "lucide-react";

interface GameCardProps {
  question: Question;
  categoryIndex: number;
  questionIndex: number;
  isRevealed: boolean;
  onSelect: () => void;
  onReview?: () => void;
}

export const GameCard = ({
  question,
  isRevealed,
  onSelect,
  onReview,
}: GameCardProps) => {
  if (isRevealed) {
    return (
      <button
        onClick={onReview}
        className="aspect-[4/3] rounded-xl bg-muted/40 border border-border/20 flex flex-col items-center justify-center gap-1 hover:bg-muted/60 transition-all group cursor-pointer"
      >
        <Check className="w-5 h-5 text-success" />
        <Eye className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="flip-card aspect-[4/3] w-full cursor-pointer group"
    >
      <div className="flip-card-inner">
        <div className="flip-card-front card-gradient rounded-xl flex items-center justify-center hover:border-primary hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <span className="font-display text-xl md:text-2xl lg:text-3xl text-primary group-hover:scale-105 transition-transform">
            {question.points}
          </span>
        </div>
      </div>
    </button>
  );
};
