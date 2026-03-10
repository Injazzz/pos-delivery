import { useEffect, useRef } from "react";
import type { Channel } from "laravel-echo";
import { getEcho } from "@/lib/echo";

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

/**
 * Generic hook — subscribe ke private channel + beberapa event.
 * Auto-cleanup saat unmount.
 *
 * Note: Connection state tracking is now handled globally by useEchoConnection hook
 * in AppShell, so don't need to track it here anymore.
 */
export function useEcho(
  channelName: string | null,
  listeners: Listener[],
  deps: unknown[] = [],
) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const echo = getEcho();
    const channel = echo.private(channelName);
    channelRef.current = channel;

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
