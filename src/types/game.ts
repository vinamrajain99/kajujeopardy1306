export interface MCQOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  isMCQ: boolean;
  options: MCQOption[];
  correctAnswerIndex?: number; // kept for backward compatibility
  answer: string;
  images: string[];
  points: number;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface HomeScreenText {
  id: string;
  text: string;
  style: 'title' | 'subtitle' | 'tagline';
}

export interface GameVersion {
  id: string;
  name: string;
  createdAt: string;
  categories: Category[];
}

export type ColorTheme = 'babyShower' | 'ocean' | 'sunset' | 'forest' | 'royal';

export interface GlobalSettings {
  homeScreenTexts: HomeScreenText[];
  colorTheme: ColorTheme;
}

export interface GameState {
  currentGame: GameVersion | null;
  revealedCards: Set<string>;
  currentQuestion: { categoryIndex: number; questionIndex: number } | null;
  showAnswer: boolean;
  scores: { player1: number; player2: number };
  player1Name: string;
  player2Name: string;
}