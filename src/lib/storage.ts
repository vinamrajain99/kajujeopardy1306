import { GameVersion, GlobalSettings, HomeScreenText } from "@/types/game";

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

export const createEmptyGame = (name: string): GameVersion => {
  const defaultPoints = [100, 200, 300, 400, 500];
  
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    categories: Array.from({ length: 5 }, (_, catIndex) => ({
      id: crypto.randomUUID(),
      name: `Category ${catIndex + 1}`,
      questions: Array.from({ length: 5 }, (_, qIndex) => ({
        id: crypto.randomUUID(),
        text: "",
        isMCQ: false,
        options: [],
        answer: "",
        images: [],
        points: defaultPoints[qIndex],
      })),
    })),
  };
};

// Global Settings
export const getGlobalSettings = (): GlobalSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const defaultSettings: GlobalSettings = {
    homeScreenTexts: [
      { id: crypto.randomUUID(), text: "Gender Reveal Jeopardy!", style: "title" as const },
    ],
    colorTheme: 'babyShower',
  };
  if (!stored) {
    return defaultSettings;
  }
  try {
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveGlobalSettings = (settings: GlobalSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
