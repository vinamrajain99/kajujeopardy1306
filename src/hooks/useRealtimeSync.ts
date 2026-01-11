import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RealtimeCallback = () => void;

export const useRealtimeSync = (
  onGamesChange?: RealtimeCallback,
  onSettingsChange?: RealtimeCallback
) => {
  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        () => {
          console.log('Games table changed, refetching...');
          onGamesChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings'
        },
        () => {
          console.log('Settings table changed, refetching...');
          onSettingsChange?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onGamesChange, onSettingsChange]);
};
