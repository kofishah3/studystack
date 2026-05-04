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
    <div className="flex flex-row gap-6 border-b border-border w-full">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === tab ? "text-text" : "text-muted hover:text-text"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-px left-0 w-full h-[2px] bg-text rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
