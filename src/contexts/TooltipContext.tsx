"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";

interface TooltipState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

interface TooltipContextProps {
  showTooltip: (text: string, e: React.MouseEvent) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextProps | undefined>(
  undefined,
);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback((text: string, e: React.MouseEvent) => {
    setTooltip({ text, x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!tooltip.visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = tooltip.x + 12;
    let y = tooltip.y - 36;
    if (x + rect.width > vw - 8) x = tooltip.x - rect.width - 12;
    if (y < 8) y = tooltip.y + 16;
    if (y + rect.height > vh - 8) y = vh - rect.height - 8;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }, [tooltip]);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {tooltip.visible && (
        <div
          ref={tooltipRef}
          className="fixed z-9999 pointer-events-none px-2 py-1 rounded-md 
          bg-gray-900 dark:bg-gray-700 text-white text-[11px] 
          font-medium shadow-lg whitespace-nowrap animate-in fade-in duration-100"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          {tooltip.text}
        </div>
      )}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("useTooltip must be used within a TooltipProvider");
  return ctx;
}
