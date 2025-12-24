import { GameVersion } from "@/types/game";

const STORAGE_KEY = "jeopardy_games";

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
    homeScreenTexts: [
      { id: crypto.randomUUID(), text: "Gender Reveal Jeopardy!", style: "title" as const },
      { id: crypto.randomUUID(), text: "The ultimate baby shower game", style: "subtitle" as const },
    ],
  };
};
