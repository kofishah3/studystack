"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import type { Theme } from "@/types/themes";
import { THEME_STORAGE_KEY } from "@/types/themes";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-surface border border-border shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 z-50 text-text flex items-center justify-center group ${className || ""}`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
      ) : (
        <Sun className="w-6 h-6 text-secondary-500 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
