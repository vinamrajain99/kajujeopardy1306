-- Create games table to store game configurations
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category_count INTEGER NOT NULL DEFAULT 5,
  questions_per_category INTEGER NOT NULL DEFAULT 5,
  player_count INTEGER NOT NULL DEFAULT 2,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (no auth required)
CREATE POLICY "Games are publicly viewable"
ON public.games
FOR SELECT
USING (true);

CREATE POLICY "Games can be created by anyone"
ON public.games
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Games can be updated by anyone"
ON public.games
FOR UPDATE
USING (true);

CREATE POLICY "Games can be deleted by anyone"
ON public.games
FOR DELETE
USING (true);

-- Create settings table for global settings
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public access for settings
CREATE POLICY "Settings are publicly viewable"
ON public.settings
FOR SELECT
USING (true);

CREATE POLICY "Settings can be created by anyone"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Settings can be updated by anyone"
ON public.settings
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();