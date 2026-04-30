-- GAMES table: restrict writes to authenticated users
DROP POLICY IF EXISTS "Games can be created by anyone" ON public.games;
DROP POLICY IF EXISTS "Games can be updated by anyone" ON public.games;
DROP POLICY IF EXISTS "Games can be deleted by anyone" ON public.games;

CREATE POLICY "Authenticated users can create games"
ON public.games FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update games"
ON public.games FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete games"
ON public.games FOR DELETE TO authenticated
USING (true);

-- SETTINGS table: restrict writes to authenticated users
DROP POLICY IF EXISTS "Settings can be created by anyone" ON public.settings;
DROP POLICY IF EXISTS "Settings can be updated by anyone" ON public.settings;

CREATE POLICY "Authenticated users can create settings"
ON public.settings FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
ON public.settings FOR UPDATE TO authenticated
USING (true);

-- GAME_SESSIONS: players (anon) can still create/update sessions to play,
-- but only authenticated admins can delete (restart) sessions
DROP POLICY IF EXISTS "Game sessions can be deleted by anyone" ON public.game_sessions;

CREATE POLICY "Authenticated users can delete game sessions"
ON public.game_sessions FOR DELETE TO authenticated
USING (true);