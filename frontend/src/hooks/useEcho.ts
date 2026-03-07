import { useEffect, useRef } from "react";
import type { Channel } from "laravel-echo";
import { getEcho } from "@/lib/echo";
import { useRealtimeStore } from "@/stores/realtimeStore";

type EventData =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

type Listener = {
  event: string;
  callback: (data: EventData) => void;
};

type ConnectionState = "connecting" | "connected" | "disconnected" | "failed";

interface PusherState {
  current: string;
  previous?: string;
}

/**
 * Generic hook — subscribe ke private channel + beberapa event.
 * Auto-cleanup saat unmount.
 */
export function useEcho(
  channelName: string | null,
  listeners: Listener[],
  deps: unknown[] = [],
) {
  const setConnection = useRealtimeStore((s) => s.setConnection);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const echo = getEcho();
    const channel = echo.private(channelName);
    channelRef.current = channel;

    // Connection state tracking
    const pusher = echo.connector?.pusher;
    if (pusher?.connection) {
      pusher.connection.bind("state_change", (states: PusherState) => {
        const { current } = states;
        const map: Record<string, ConnectionState> = {
          initialized: "connecting",
          connecting: "connecting",
          connected: "connected",
          disconnected: "disconnected",
          failed: "failed",
          unavailable: "failed",
        };
        setConnection(map[current] ?? "disconnected");
      });
    }

    // Register all listeners
    listeners.forEach(({ event, callback }) => {
      channel.listen(`.${event}`, callback);
    });

    return () => {
      listeners.forEach(({ event }) => {
        channel.stopListening(`.${event}`);
      });
      echo.leave(channelName);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, ...deps]);

  return channelRef;
}
