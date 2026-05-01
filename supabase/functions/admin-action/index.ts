import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Action =
  | { type: "verify_password" }
  | { type: "save_game"; game: Record<string, unknown> }
  | { type: "delete_game"; gameId: string }
  | { type: "save_settings"; key: string; value: unknown }
  | { type: "restart_session"; gameId: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ADMIN_PASSWORD) {
    return new Response(
      JSON.stringify({ error: "Admin password not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Invalid admin password" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Action;
  try {
    body = (await req.json()) as Action;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    switch (body.type) {
      case "verify_password":
        return json({ ok: true });

      case "save_game": {
        const { error } = await supabase
          .from("games")
          .upsert(body.game as never, { onConflict: "id" });
        if (error) throw error;
        return json({ ok: true });
      }

      case "delete_game": {
        const { error } = await supabase.from("games").delete().eq("id", body.gameId);
        if (error) throw error;
        // also clean up sessions for that game
        await supabase.from("game_sessions").delete().eq("game_id", body.gameId);
        return json({ ok: true });
      }

      case "save_settings": {
        const { error } = await supabase
          .from("settings")
          .upsert({ key: body.key, value: body.value as never }, { onConflict: "key" });
        if (error) throw error;
        return json({ ok: true });
      }

      case "restart_session": {
        const { error } = await supabase
          .from("game_sessions")
          .delete()
          .eq("game_id", body.gameId)
          .eq("is_active", true);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("admin-action error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
