"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import PromptPopup from "@/components/common/PromptPopup";
import { LucideIcon } from "lucide-react";

type PopupType = "info" | "confirmation";

interface PromptConfig {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  type: PopupType;
  onAccept?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

interface PromptContextProps {
  showPrompt: (config: PromptConfig) => void;
  hidePrompt: () => void;
}

const PromptContext = createContext<PromptContextProps | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showPrompt = useCallback((newConfig: PromptConfig) => {
    setConfig(newConfig);
    setIsVisible(true);
  }, []);

  const hidePrompt = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setConfig(null), 300);
  }, []);

  const handleAccept = async () => {
    if (config?.onAccept) {
      await config.onAccept();
    }
    hidePrompt();
  };

  const handleCancel = async () => {
    if (config?.onCancel) {
      await config.onCancel();
    }
    hidePrompt();
  };

  return (
    <PromptContext.Provider value={{ showPrompt, hidePrompt }}>
      {children}
      {config && (
        <PromptPopup
          icon={config.icon}
          title={config.title}
          description={config.description}
          type={config.type}
          onAccept={handleAccept}
          onCancel={handleCancel}
          isVisible={isVisible}
        />
      )}
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}
