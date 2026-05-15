"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import SidebarQuickAction from "./sidebar-widgets/SidebarQuickAction";
import SidebarHeatmap from "./sidebar-widgets/SidebarHeatmap";
import SidebarLeaderboard from "./sidebar-widgets/SidebarLeaderboard";

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div id="quick-actions-section" className="w-full">
        <SidebarQuickAction />
      </div>
      <div id="heatmap-section" className="w-full">
        <SidebarHeatmap />
      </div>
      <div id="leaderboard-section" className="w-full">
        <SidebarLeaderboard />
      </div>
    </>
  );

  return (
    <>
      <aside
        id="sidebar-container"
        className="hidden md:flex w-xs bg-surface p-4 border-r border-border h-full overflow-y-auto flex-col gap-6 shrink-0"
      >
        {sidebarContent}
      </aside>

      <button
        id="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className="md:hidden fixed bottom-24 left-4 z-60 flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 
        text-white shadow-lg hover:bg-primary-700 active:scale-95 transition-all"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="md:hidden fixed inset-0 z-70 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="sidebar-mobile-drawer"
        className={`md:hidden fixed top-0 left-0 z-80 h-full w-72 bg-surface border-r border-border p-4 flex flex-col gap-6 overflow-y-auto shadow-xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-text tracking-wide uppercase opacity-60">
            Menu
          </span>
          <button
            id="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg hover:bg-border/40 text-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
