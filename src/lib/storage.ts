import { GameVersion, GlobalSettings, HomeScreenSettings } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const SETTINGS_KEY = "global_settings";

// Convert database row to GameVersion
const dbToGame = (row: any): GameVersion => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
  categoryCount: row.category_count,
  questionsPerCategory: row.questions_per_category,
  playerCount: row.player_count,
  categories: row.categories,
});

// Convert GameVersion to database format
const gameToDb = (game: GameVersion) => ({
  id: game.id,
  name: game.name,
  created_at: game.createdAt,
  category_count: game.categoryCount,
  questions_per_category: game.questionsPerCategory,
  player_count: game.playerCount,
  categories: game.categories as unknown as Json,
});

export const getStoredGames = async (): Promise<GameVersion[]> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching games:", error);
    return [];
  }

  return (data || []).map(dbToGame);
};

export const saveGame = async (game: GameVersion): Promise<void> => {
  const dbGame = gameToDb(game);
  
  const { error } = await supabase
    .from("games")
    .upsert(dbGame, { onConflict: "id" });

  if (error) {
    console.error("Error saving game:", error);
    throw error;
  }
};

export const deleteGame = async (gameId: string): Promise<void> => {
  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", gameId);

  if (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
};

export const getGameById = async (gameId: string): Promise<GameVersion | null> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching game:", error);
    return null;
  }

  return data ? dbToGame(data) : null;
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
    playerCount: 2,
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
    playerCount: game.playerCount || 2,
    categories: resizedCategories,
  };
};

// Global Settings
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
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

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    console.error("Error fetching settings:", error);
    return defaultSettings;
  }

  if (!data) {
    return defaultSettings;
  }

  try {
    const parsed = data.value as any;
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

export const saveGlobalSettings = async (settings: GlobalSettings): Promise<void> => {
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: SETTINGS_KEY, value: settings as unknown as Json },
      { onConflict: "key" }
    );

  if (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
};