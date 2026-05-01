import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "admin_password";

export const getAdminPassword = (): string | null => {
  return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
};

export const setAdminPassword = (password: string, remember: boolean) => {
  sessionStorage.setItem(STORAGE_KEY, password);
  if (remember) {
    localStorage.setItem(STORAGE_KEY, password);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const clearAdminPassword = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
};

export const isAdminAuthed = (): boolean => !!getAdminPassword();

export type AdminAction =
  | { type: "verify_password" }
  | { type: "save_game"; game: Record<string, unknown> }
  | { type: "delete_game"; gameId: string }
  | { type: "save_settings"; key: string; value: unknown }
  | { type: "restart_session"; gameId: string };

export const callAdminAction = async (action: AdminAction, passwordOverride?: string) => {
  const password = passwordOverride ?? getAdminPassword();
  if (!password) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke("admin-action", {
    body: action,
    headers: { "x-admin-password": password },
  });

  if (error) {
    // supabase.functions.invoke wraps non-2xx as error; try to extract message
    const msg = (error as any)?.context?.body?.error || error.message || "Request failed";
    throw new Error(msg);
  }
  return data;
};

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  try {
    await callAdminAction({ type: "verify_password" }, password);
    return true;
  } catch {
    return false;
  }
};
