"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ToastContainer, type ToastData, type ToastType } from "@/components/common/ToastNotification";
import { useSocket } from "@/contexts/SocketContext";
import type { ContentActivityKind } from "@/lib/content-activity-notify";

interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextProps {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

function ContentActivityToasts() {
  const { socket } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const onActivity = (payload: { kind?: ContentActivityKind }) => {
      const kind = payload?.kind;
      const message =
        kind === "answer"
          ? "Someone answered your question."
          : kind === "interaction"
            ? "Someone reacted to your content."
            : "Someone commented on your post.";

      showToast({
        type: "info",
        title: "New activity",
        message,
      });
    };

    socket.on("content:activity", onActivity);
    return () => {
      socket.off("content:activity", onActivity);
    };
  }, [socket, showToast]);

  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, ...config }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ContentActivityToasts />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
