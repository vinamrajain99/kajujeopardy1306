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
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <span className="text-muted-foreground text-sm uppercase tracking-wider">
              {categoryName}
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-gold">
              ${question.points}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Question Section */}
        <div className="flex-1 flex flex-col animate-slide-in-left">
          <div className="glass rounded-2xl p-6 md:p-8 flex-1 flex flex-col">
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight mb-6">
              {question.text || "Question not configured"}
            </h1>

            {/* MCQ Options */}
            {question.isMCQ && question.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                {question.options.map((option: MCQOption, index: number) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(index)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedOption === index
                        ? "border-gold bg-gold/10 glow-gold"
                        : "border-border hover:border-gold/50"
                    } ${
                      showAnswer && index === question.correctAnswerIndex
                        ? "border-success bg-success/20"
                        : ""
                    } ${
                      showAnswer &&
                      selectedOption === index &&
                      index !== question.correctAnswerIndex
                        ? "border-destructive bg-destructive/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-display text-lg">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-lg">{option.text}</span>
                      {showAnswer && index === question.correctAnswerIndex && (
                        <Check className="w-5 h-5 text-success ml-auto" />
                      )}
                      {showAnswer &&
                        selectedOption === index &&
                        index !== question.correctAnswerIndex && (
                          <X className="w-5 h-5 text-destructive ml-auto" />
                        )}
                    </div>
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt={`Option ${String.fromCharCode(65 + index)}`}
                        className="mt-3 rounded-lg max-h-24 object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Answer Section */}
            {showAnswer && !question.isMCQ && (
              <div className="mt-6 p-6 rounded-xl bg-success/20 border-2 border-success animate-scale-in">
                <h3 className="font-display text-xl text-success mb-2">
                  Answer
                </h3>
                <p className="text-lg text-foreground">{question.answer}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="gold"
              size="lg"
              onClick={() => setShowAnswer(true)}
              disabled={showAnswer}
            >
              <Eye className="w-5 h-5 mr-2" />
              Reveal Answer
            </Button>

            {showAnswer && (
              <>
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => onCorrect(1)}
                  className="animate-scale-in"
                >
                  {player1Name} Correct
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => onCorrect(2)}
                  className="animate-scale-in"
                >
                  {player2Name} Correct
                </Button>
              </>
            )}

            <Button variant="outline" size="lg" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Board
            </Button>
          </div>
        </div>

        {/* Image Section */}
        {question.images.length > 0 && (
          <div className="lg:w-[45%] animate-slide-in-right">
            <div className="glass rounded-2xl p-4 h-full flex items-center justify-center overflow-hidden">
              <img
                key={currentImageIndex}
                src={question.images[currentImageIndex]}
                alt="Question context"
                className="max-w-full max-h-[60vh] object-contain rounded-lg animate-scale-in"
              />
            </div>
            {question.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {question.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-gold scale-125"
                        : "bg-muted hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
