import { useEffect } from "react";
import { getEcho } from "@/lib/echo";
import { useRealtimeStore } from "@/stores/realtimeStore";

/**
 * Hook untuk mendengarkan connection state dari Echo/Pusher
 * secara independen dari channel subscription.
 * Panggil ini di root component atau App.tsx agar selalu aktif.
 */
export function useEchoConnection() {
  const setConnection = useRealtimeStore((s) => s.setConnection);

  useEffect(() => {
    const echo = getEcho();
    const pusher = echo.connector?.pusher;

    if (!pusher?.connection) {
      console.warn("Pusher connection not available");
      return;
    }

    // Map Pusher states ke application states
    const map: Record<
      string,
      "connecting" | "connected" | "disconnected" | "failed"
    > = {
      initialized: "connecting",
      connecting: "connecting",
      connected: "connected",
      disconnected: "disconnected",
      failed: "failed",
      unavailable: "failed",
    };

    // Bind ke state_change event
    const handleStateChange = (states: {
      current: string;
      previous?: string;
    }) => {
      const nextState = map[states.current] ?? "disconnected";
      setConnection(nextState);
    };

    pusher.connection.bind("state_change", handleStateChange);

    // Initial state
    const initialState = map[pusher.connection.state] ?? "disconnected";
    setConnection(initialState);

    return () => {
      pusher.connection?.unbind("state_change", handleStateChange);
    };
  }, [setConnection]);
}
