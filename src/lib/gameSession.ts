import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { callAdminAction } from "@/lib/adminAuth";

export interface GameSession {
  id: string;
  gameId: string;
  playerNames: string[];
  scores: number[];
  revealedCards: string[];
  cardAnswers: Record<string, number | null>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Convert database row to GameSession
const dbToSession = (row: any): GameSession => ({
  id: row.id,
  gameId: row.game_id,
  playerNames: row.player_names || [],
  scores: row.scores || [],
  revealedCards: row.revealed_cards || [],
  cardAnswers: row.card_answers || {},
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Get active session for a game
export const getActiveSession = async (gameId: string): Promise<GameSession | null> => {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("game_id", gameId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data ? dbToSession(data) : null;
};

// Create a new game session
export const createGameSession = async (
  gameId: string,
  playerNames: string[],
  playerCount: number
): Promise<GameSession | null> => {
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      game_id: gameId,
      player_names: playerNames as unknown as Json,
      scores: Array(playerCount).fill(0) as unknown as Json,
      revealed_cards: [] as unknown as Json,
      card_answers: {} as unknown as Json,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return null;
  }

  return dbToSession(data);
};

// Update session progress
export const updateSessionProgress = async (
  sessionId: string,
  updates: {
    playerNames?: string[];
    scores?: number[];
    revealedCards?: string[];
    cardAnswers?: Record<string, number | null>;
  }
): Promise<void> => {
  const updateData: any = {};
  
  if (updates.playerNames !== undefined) {
    updateData.player_names = updates.playerNames as unknown as Json;
  }
  if (updates.scores !== undefined) {
    updateData.scores = updates.scores as unknown as Json;
  }
  if (updates.revealedCards !== undefined) {
    updateData.revealed_cards = updates.revealedCards as unknown as Json;
  }
  if (updates.cardAnswers !== undefined) {
    updateData.card_answers = updates.cardAnswers as unknown as Json;
  }

  const { error } = await supabase
    .from("game_sessions")
    .update(updateData)
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating session:", error);
  }
};

// End a game session (mark as inactive)
export const endGameSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from("game_sessions")
    .update({ is_active: false })
    .eq("id", sessionId);

  if (error) {
    console.error("Error ending session:", error);
  }
};

// Reset/restart a game session (delete the active one) — admin only
export const restartGameSession = async (gameId: string): Promise<void> => {
  await callAdminAction({ type: "restart_session", gameId });
};

// Get all sessions for a game (for history)
export const getGameSessions = async (gameId: string): Promise<GameSession[]> => {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return (data || []).map(dbToSession);
};
