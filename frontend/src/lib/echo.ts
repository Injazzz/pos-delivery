import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EchoConfig = {
  broadcaster: "reverb";
  key: string;
  wsHost: string;
  wsPort: number;
  wssPort: number;
  forceTLS: boolean;
  enabledTransports: string[];
  authEndpoint: string;
  auth: {
    headers: {
      Authorization: string;
      Accept: string;
    };
  };
};

type BaseEcho = Echo<"reverb">;

// Kemudian kita extend dengan options yang kita butuhkan
type EchoInstance = BaseEcho & {
  options: EchoConfig;
};

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: EchoInstance;
  }
}

let echoInstance: EchoInstance | null = null;

export function getEcho(): EchoInstance {
  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const echo = new Echo<"reverb">({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
        Accept: "application/json",
      },
    },
  });

  // Cast ke EchoInstance karena kita tahu struktur options-nya
  echoInstance = echo as EchoInstance;

  window.Echo = echoInstance;
  return echoInstance;
}

export function updateEchoToken(token: string) {
  if (!echoInstance) return;

  // Karena kita sudah melakukan cast di atas, TypeScript sekarang tahu struktur options
  echoInstance.options.auth.headers.Authorization = `Bearer ${token}`;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
