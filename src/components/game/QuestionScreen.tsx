import { useState, useEffect } from "react";
import { Question, MCQOption } from "@/types/game";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Check, X } from "lucide-react";

interface QuestionScreenProps {
  question: Question;
  categoryName: string;
  onBack: () => void;
  onCorrect: (player: 1 | 2) => void;
  onWrong: () => void;
  player1Name: string;
  player2Name: string;
}

export const QuestionScreen = ({
  question,
  categoryName,
  onBack,
  onCorrect,
  player1Name,
  player2Name,
}: QuestionScreenProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (question.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % question.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [question.images.length]);

  const handleOptionSelect = (index: number) => {
    if (!showAnswer) {
      setSelectedOption(index);
    }
  };

  return (
    <div className="min-h-screen bg-background confetti-bg p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <div>
          <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
            {categoryName}
          </span>
          <h2 className="font-display text-lg md:text-xl text-primary">
            {question.points} points
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Question Section */}
        <div className="flex-1 flex flex-col animate-slide-in-left">
          <div className="glass rounded-2xl p-5 md:p-6 flex-1 flex flex-col">
            <h1 className="font-display text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-4">
              {question.text || "Question not configured"}
            </h1>

            {/* MCQ Options */}
            {question.isMCQ && question.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
                {question.options.map((option: MCQOption, index: number) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(index)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
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
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center font-display text-sm text-secondary">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm font-medium">{option.text}</span>
                      {showAnswer && option.isCorrect && (
                        <Check className="w-4 h-4 text-success ml-auto" />
                      )}
                      {showAnswer &&
                        selectedOption === index &&
                        !option.isCorrect && (
                          <X className="w-4 h-4 text-destructive ml-auto" />
                        )}
                    </div>
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt={`Option ${String.fromCharCode(65 + index)}`}
                        className="mt-2 rounded-lg max-h-20 object-cover"
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

        {/* Image Section */}
        {question.images.length > 0 && (
          <div className="lg:w-[40%] animate-slide-in-right">
            <div className="glass rounded-2xl p-3 h-full flex items-center justify-center overflow-hidden">
              <img
                key={currentImageIndex}
                src={question.images[currentImageIndex]}
                alt="Question context"
                className="max-w-full max-h-[50vh] object-contain rounded-lg animate-scale-in"
              />
            </div>
            {question.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
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
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-border/30">
        <Button
          variant="gold"
          size="default"
          onClick={() => setShowAnswer(true)}
          disabled={showAnswer}
        >
          <Eye className="w-4 h-4 mr-2" />
          Reveal Answer
        </Button>

        {showAnswer && (
          <>
            <Button
              variant="success"
              size="default"
              onClick={() => onCorrect(1)}
              className="animate-scale-in"
            >
              {player1Name} ✓
            </Button>
            <Button
              variant="success"
              size="default"
              onClick={() => onCorrect(2)}
              className="animate-scale-in"
            >
              {player2Name} ✓
            </Button>
          </>
        )}

        <Button variant="outline" size="default" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Board
        </Button>
      </div>
    </div>
  );
};
