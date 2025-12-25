import { GameVersion, GlobalSettings, HomeScreenSettings } from "@/types/game";

const STORAGE_KEY = "jeopardy_games";
const SETTINGS_KEY = "jeopardy_settings";

export const getStoredGames = (): GameVersion[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveGame = (game: GameVersion): void => {
  const games = getStoredGames();
  const existingIndex = games.findIndex((g) => g.id === game.id);
  if (existingIndex >= 0) {
    games[existingIndex] = game;
  } else {
    games.push(game);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

export const deleteGame = (gameId: string): void => {
  const games = getStoredGames().filter((g) => g.id !== gameId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

export const getGameById = (gameId: string): GameVersion | null => {
  const games = getStoredGames();
  return games.find((g) => g.id === gameId) || null;
};

export const createEmptyGame = (name: string, categoryCount = 5, questionsPerCategory = 5): GameVersion => {
  const getDefaultPoints = (index: number, total: number) => {
    return (index + 1) * Math.round(500 / total);
  };
  
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    categoryCount,
    questionsPerCategory,
    categories: Array.from({ length: categoryCount }, (_, catIndex) => ({
      id: crypto.randomUUID(),
      name: `Category ${catIndex + 1}`,
      questions: Array.from({ length: questionsPerCategory }, (_, qIndex) => ({
        id: crypto.randomUUID(),
        text: "",
        isMCQ: false,
        options: [],
        answer: "",
        images: [],
        points: getDefaultPoints(qIndex, questionsPerCategory),
      })),
    })),
  };
};

export const resizeGame = (game: GameVersion, newCategoryCount: number, newQuestionsPerCategory: number): GameVersion => {
  const getDefaultPoints = (index: number, total: number) => {
    return (index + 1) * Math.round(500 / total);
  };

  const resizedCategories = Array.from({ length: newCategoryCount }, (_, catIndex) => {
    const existingCategory = game.categories[catIndex];
    if (existingCategory) {
      // Resize questions in existing category
      const resizedQuestions = Array.from({ length: newQuestionsPerCategory }, (_, qIndex) => {
        const existingQuestion = existingCategory.questions[qIndex];
        if (existingQuestion) {
          return existingQuestion;
        }
        return {
          id: crypto.randomUUID(),
          text: "",
          isMCQ: false,
          options: [],
          answer: "",
          images: [],
          points: getDefaultPoints(qIndex, newQuestionsPerCategory),
        };
      });
      return { ...existingCategory, questions: resizedQuestions };
    }
    // Create new category
    return {
      id: crypto.randomUUID(),
      name: `Category ${catIndex + 1}`,
      questions: Array.from({ length: newQuestionsPerCategory }, (_, qIndex) => ({
        id: crypto.randomUUID(),
        text: "",
        isMCQ: false,
        options: [],
        answer: "",
        images: [],
        points: getDefaultPoints(qIndex, newQuestionsPerCategory),
      })),
    };
  });

  return {
    ...game,
    categoryCount: newCategoryCount,
    questionsPerCategory: newQuestionsPerCategory,
    categories: resizedCategories,
  };
};

// Global Settings
export const getGlobalSettings = (): GlobalSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const defaultHomeScreen: HomeScreenSettings = {
    heading: "Gender Reveal Jeopardy!",
    subheading: undefined,
    tagline: undefined,
    image: 'baby',
  };
  const defaultSettings: GlobalSettings = {
    homeScreenTexts: [],
    homeScreen: defaultHomeScreen,
    colorTheme: 'babyShower',
    timerEnabled: false,
    timerDuration: 30,
  };
  if (!stored) {
    return defaultSettings;
  }
  try {
    const parsed = JSON.parse(stored);
    // Migration: if old format exists, migrate to new format
    if (parsed.homeScreenTexts && parsed.homeScreenTexts.length > 0 && !parsed.homeScreen) {
      const texts = parsed.homeScreenTexts;
      const heading = texts.find((t: any) => t.style === 'title')?.text;
      const subheading = texts.find((t: any) => t.style === 'subtitle')?.text;
      const tagline = texts.find((t: any) => t.style === 'tagline')?.text;
      parsed.homeScreen = {
        heading,
        subheading,
        tagline,
        image: 'baby',
      };
    }
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveGlobalSettings = (settings: GlobalSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
