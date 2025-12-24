import { Question } from "@/types/game";

interface GameCardProps {
  question: Question;
  categoryIndex: number;
  questionIndex: number;
  isRevealed: boolean;
  onSelect: () => void;
}

export const GameCard = ({
  question,
  isRevealed,
  onSelect,
}: GameCardProps) => {
  if (isRevealed) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
        <span className="text-muted-foreground font-display text-2xl">✓</span>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="flip-card aspect-[4/3] w-full cursor-pointer group"
    >
      <div className="flip-card-inner">
        <div className="flip-card-front card-gradient rounded-lg border-2 border-gold/50 flex items-center justify-center hover:border-gold hover:glow-gold transition-all duration-300">
          <span className="font-display text-3xl md:text-4xl lg:text-5xl text-gold text-shadow-glow group-hover:scale-110 transition-transform">
            ${question.points}
          </span>
        </div>
      </div>
    </button>
  );
};
