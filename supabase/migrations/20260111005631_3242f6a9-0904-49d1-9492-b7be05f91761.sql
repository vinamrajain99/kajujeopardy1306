-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-images', 'game-images', true);

-- Allow public read access to game images
CREATE POLICY "Game images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

-- Allow anyone to upload game images
CREATE POLICY "Anyone can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-images');

-- Allow anyone to delete game images
CREATE POLICY "Anyone can delete game images"
ON storage.objects FOR DELETE
USING (bucket_id = 'game-images');

-- Create game_sessions table to track game progress
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_names JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  revealed_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  card_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Public access policies for game sessions
CREATE POLICY "Game sessions are publicly viewable"
ON public.game_sessions FOR SELECT
USING (true);

CREATE POLICY "Game sessions can be created by anyone"
ON public.game_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Game sessions can be updated by anyone"
ON public.game_sessions FOR UPDATE
USING (true);

CREATE POLICY "Game sessions can be deleted by anyone"
ON public.game_sessions FOR DELETE
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for game_sessions
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;