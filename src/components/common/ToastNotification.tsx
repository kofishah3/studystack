"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X, UserRound } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  /** In-app route to open when the toast body is clicked (client navigation). */
  href?: string;
  actorProfileUrl?: string | null;
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<
  ToastType,
  { icon: React.ReactNode; container: string; bar: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} strokeWidth={2} />,
    container: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
    bar: "bg-emerald-500",
  },
  error: {
    icon: <XCircle size={18} strokeWidth={2} />,
    container: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
    bar: "bg-red-500",
  },
  info: {
    icon: <Info size={18} strokeWidth={2} />,
    container: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
    bar: "bg-primary-500",
  },
  warning: {
    icon: <AlertTriangle size={18} strokeWidth={2} />,
    container: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
    bar: "bg-yellow-400",
  },
};

const iconColors: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-primary-500",
  warning: "text-yellow-500",
};

const TOAST_DURATION_MS = 4000;
const ANIMATION_MS = 350;

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const router = useRouter();
  const clickable = Boolean(toast.href?.startsWith("/"));

  const style = toastStyles[toast.type];
  const iconColor = iconColors[toast.type];

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), ANIMATION_MS);
  };

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, TOAST_DURATION_MS);
    return () => clearTimeout(dismissTimer);
  }, []);

  const handleNavigate = () => {
    if (!clickable || !toast.href) return;
    handleDismiss();
    router.push(toast.href);
  };

  const handleBodyKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  const avatarOrIcon = toast.actorProfileUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={toast.actorProfileUrl}
      alt=""
      className="h-9 w-9 rounded-full object-cover"
    />
  ) : clickable ? (
    <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${iconColor}`}>
      <UserRound size={18} strokeWidth={2} />
    </span>
  ) : (
    <span className={`mt-0.5 shrink-0 ${iconColor}`}>{style.icon}</span>
  );

  return (
    <div
      id={`toast-${toast.id}`}
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 w-80 rounded-xl shadow-xl overflow-hidden px-4 py-3.5
        transition-all ease-out
        ${style.container}
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
      style={{ transitionDuration: `${ANIMATION_MS}ms` }}
    >
      <div
        id="toast-icon-container"
        className={`shrink-0 ${clickable ? "cursor-pointer" : ""}`}
        onClick={handleNavigate}
        onKeyDown={handleBodyKeyDown}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable ? "Open related post" : undefined}
      >
        {avatarOrIcon}
      </div>

      <div
        id="toast-content"
        className={`flex-1 min-w-0 text-left ${clickable ? "cursor-pointer hover:opacity-90" : ""}`}
        role={clickable ? "link" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={handleNavigate}
        onKeyDown={handleBodyKeyDown}
      >
        {toast.title && (
          <p id="toast-title" className="text-sm font-semibold leading-snug">
            {toast.title}
          </p>
        )}
        <p
          id="toast-message"
          className={`text-xs text-gray-500 dark:text-gray-400 leading-snug ${toast.title ? "mt-0.5" : ""}`}
        >
          {toast.message}
        </p>
      </div>

      <button
        id={`toast-dismiss-${toast.id}`}
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      <div
        id="toast-progress-container"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800"
      >
        <div
          id="toast-progress-bar"
          className={`w-2 h-full ${style.bar} transition-none`}
          style={{ width: `${progress}%`, transition: "width 30ms linear" }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      id="toast-container"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-60 flex flex-col gap-3 items-end pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
