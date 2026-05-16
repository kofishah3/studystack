"use client";

import { SessionProvider } from "next-auth/react";
import { PromptProvider } from "@/contexts/PromptContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { TooltipProvider } from "@/contexts/TooltipContext";
import { SocketProvider } from "@/contexts/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <PromptProvider>
          <ToastProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ToastProvider>
        </PromptProvider>
      </SocketProvider>
    </SessionProvider>
  );
}