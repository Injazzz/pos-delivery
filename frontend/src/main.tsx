/* eslint-disable @typescript-eslint/no-explicit-any */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRouter } from "./router";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/shared/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      retry: (failureCount, error: any) => {
        // Jangan retry untuk 401, 403, 404
        if ([401, 403, 404].includes(error?.response?.status)) return false;
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider delayDuration={300}>
          <AppRouter />
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: "#0f172a",
                border: "1px solid #1e293b",
                color: "#f1f5f9",
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
