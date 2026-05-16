"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { ToastContainer, type ToastData, type ToastType } from "@/components/common/ToastNotification";
import type { ContentActivityKind } from "@/types/database";

interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  href?: string;
  actorProfileUrl?: string | null;
}

interface ToastContextProps {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

function ContentActivityToasts() {
  const { showToast } = useToast();
  const sinceRef = useRef<string>("");
  const shownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    sinceRef.current = new Date().toISOString();

    const poll = async () => {
      if (typeof window === "undefined") return;
      if (document.visibilityState !== "visible") return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const since = sinceRef.current;
        const res = await fetch(
          `/api/me/content-activity?since=${encodeURIComponent(since)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          events?: Array<{
            id: string;
            kind: ContentActivityKind;
            created_at: string;
            actor_display_name?: string;
            actor_profile_url?: string | null;
            href?: string;
          }>;
        };
        const events = data.events ?? [];
        let maxCreated = since;

        for (const ev of events) {
          if (shownIdsRef.current.has(ev.id)) continue;
          shownIdsRef.current.add(ev.id);
          if (shownIdsRef.current.size > 400) {
            shownIdsRef.current = new Set(
              [...shownIdsRef.current].slice(-200),
            );
          }

          const who = ev.actor_display_name?.trim() || "Someone";

          const message =
            ev.kind === "answer"
              ? "answered your question."
              : ev.kind === "interaction"
                ? "reacted to your content."
                : "commented on your post.";

          showToast({
            type: "info",
            title: who,
            message,
            href: ev.href,
            actorProfileUrl: ev.actor_profile_url ?? null,
          });

          if (ev.created_at > maxCreated) maxCreated = ev.created_at;
        }

        if (events.length > 0) sinceRef.current = maxCreated;
      } catch {
        // Offline or transient errors — next interval retries
      }
    };

    const intervalId = setInterval(poll, 8000);
    void poll();
    return () => clearInterval(intervalId);
  }, [showToast]);

  useEffect(() => {
    const onAuth = () => {
      sinceRef.current = new Date().toISOString();
      shownIdsRef.current.clear();
    };
    window.addEventListener("studystack:auth-token", onAuth);
    return () => window.removeEventListener("studystack:auth-token", onAuth);
  }, []);

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
