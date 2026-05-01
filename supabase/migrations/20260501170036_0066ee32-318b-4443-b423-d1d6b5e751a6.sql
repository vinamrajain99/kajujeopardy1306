
-- Lock down writes on games, settings, and game_sessions DELETE.
-- Admin mutations will go through an edge function using the service role.

-- games: drop authenticated-only policies (no one with anon/authenticated key can write)
DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can delete games" ON public.games;

-- settings: same
DROP POLICY IF EXISTS "Authenticated users can create settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;

-- game_sessions: keep public INSERT/UPDATE/SELECT (player progress), block DELETE entirely
DROP POLICY IF EXISTS "Authenticated users can delete game sessions" ON public.game_sessions;
