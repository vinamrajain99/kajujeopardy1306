-- Enable REPLICA IDENTITY FULL for realtime (ensures full row data is sent)
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.settings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;