import React from "react";

interface ProfileTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileTabs({
  tabs,
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  return (
    <div className="flex flex-row gap-8 border-b border-border/50 w-full overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-4 text-xs sm:text-sm font-bold transition-all duration-300 relative whitespace-nowrap cursor-pointer ${
            activeTab === tab ? "text-text" : "text-muted hover:text-text/70"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary-500 rounded-full animate-in fade-in slide-in-from-left-2 duration-300" />
          )}
        </button>
      ))}
    </div>
  );
}
