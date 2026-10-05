import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface DatabaseChangeEvent {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST';
  record?: any;
  oldRecord?: any;
  timestamp: number;
}

interface UseAdminRealtimeOptions {
  tables?: Array<'shopping_lists' | 'shopping_items' | 'admin_audit_logs' | 'support_tickets'>;
  onDatabaseChange?: (event: DatabaseChangeEvent) => void;
  enabled?: boolean;
}

/**
 * PHASE 6: Authoritative Supabase Realtime Hook for Admin Panel
 * Subscribes to database changes and broadcasts, triggering UI updates
 * without requiring full page refresh.
 */
export function useAdminRealtime({
  tables = ['shopping_lists', 'admin_audit_logs'],
  onDatabaseChange,
  enabled = true,
}: UseAdminRealtimeOptions) {
  const onDatabaseChangeRef = useRef(onDatabaseChange);
  onDatabaseChangeRef.current = onDatabaseChange;

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabase) {
      return;
    }

    const channelName = `yaad_admin_realtime_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelName);

    // 1. Subscribe to Postgres table changes
    tables.forEach((tableName) => {
      channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload: any) => {
          if (onDatabaseChangeRef.current) {
            onDatabaseChangeRef.current({
              table: tableName,
              eventType: payload.eventType || 'UPDATE',
              record: payload.new,
              oldRecord: payload.old,
              timestamp: Date.now(),
            });
          }
        }
      );
    });

    // 2. Also listen for administrative broadcast messages
    channel.on('broadcast', { event: 'admin_mutation' }, (payload: any) => {
      if (onDatabaseChangeRef.current) {
        onDatabaseChangeRef.current({
          table: payload.payload?.table || 'system',
          eventType: 'BROADCAST',
          record: payload.payload,
          timestamp: Date.now(),
        });
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connected to Supabase realtime
      }
    });

    return () => {
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[Admin Realtime] Error cleaning up channel:', err);
      }
    };
  }, [enabled, tables.join(',')]);
}
