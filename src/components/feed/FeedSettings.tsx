"use client";

import { useState, useRef, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  Check,
  GraduationCap,
  Building2,
  SortAsc,
  Clock,
} from "lucide-react";

export type FeedSort = "latest" | "demand" | "oldest";
export type FeedFilter = "all" | "mine";

export interface FeedSettingsState {
  sort: FeedSort;
  schoolFilter: FeedFilter;
  degreeFilter: FeedFilter;
  timeFilter: "all" | "week" | "month";
}

interface SegmentedControlProps<T> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  idPrefix: string;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  idPrefix,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex bg-muted/20 p-1 rounded-xl border border-border">
      {options.map((opt) => (
        <button
          key={opt.id}
          id={`${idPrefix}-${opt.id}`}
          onClick={() => onChange(opt.id)}
          className={`
            flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all
            ${value === opt.id ? "bg-surface text-primary-600 shadow-sm" : "text-muted hover:text-text"}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface FeedSettingsProps {
  onSettingsChange: (settings: FeedSettingsState) => void;
  initialSettings?: Partial<FeedSettingsState>;
}

export default function FeedSettings({
  onSettingsChange,
  initialSettings,
}: FeedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<FeedSettingsState>({
    sort: "demand",
    schoolFilter: "all",
    degreeFilter: "all",
    timeFilter: "all",
    ...initialSettings,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSetting = <K extends keyof FeedSettingsState>(
    key: K,
    value: FeedSettingsState[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div ref={containerRef} id="feed-settings-container" className="relative">
      <button
        id="feed-settings-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
          ${isOpen ? "bg-primary-50 border-primary-500 text-primary-600 shadow-md scale-[1.02]" : "bg-surface border-border text-text hover:border-primary-300 hover:bg-muted/5"}
          font-semibold text-sm cursor-pointer
        `}
      >
        <Filter size={16} />
        <span>Feed Settings</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id="feed-settings-popover"
          className="
            absolute top-full right-0 mt-3 w-72 bg-surface border border-border rounded-2xl shadow-2xl z-30
            overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200
          "
        >
          <div className="p-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted px-1">
                <SortAsc size={12} />
                <span>Sort By</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  {
                    id: "demand",
                    label: "Demand Score",
                    icon: <Check size={14} />,
                  },
                  {
                    id: "latest",
                    label: "Latest First",
                    icon: <Clock size={14} />,
                  },
                  {
                    id: "oldest",
                    label: "Oldest First",
                    icon: <Check size={14} />,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`sort-${item.id}`}
                    onClick={() => updateSetting("sort", item.id as FeedSort)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors
                      ${settings.sort === item.id ? "bg-primary-500 text-white font-bold" : "text-text hover:bg-muted/10"}
                    `}
                  >
                    <span>{item.label}</span>
                    {settings.sort === item.id && item.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/40 mx-1" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted px-1">
                <Filter size={12} />
                <span>Filters</span>
              </div>

              <div className="space-y-4 px-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-text/80">
                    <Building2 size={12} />
                    <span>School</span>
                  </div>
                  <SegmentedControl
                    idPrefix="filter-school"
                    value={settings.schoolFilter}
                    options={[
                      { id: "all", label: "All Schools" },
                      { id: "mine", label: "My School" },
                    ]}
                    onChange={(val) => updateSetting("schoolFilter", val)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-text/80">
                    <GraduationCap size={12} />
                    <span>Program</span>
                  </div>
                  <SegmentedControl
                    idPrefix="filter-degree"
                    value={settings.degreeFilter}
                    options={[
                      { id: "all", label: "All Programs" },
                      { id: "mine", label: "My Program" },
                    ]}
                    onChange={(val) => updateSetting("degreeFilter", val)}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/40 mx-1" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted px-1">
                <Clock size={12} />
                <span>Time Range</span>
              </div>
              <SegmentedControl
                idPrefix="time"
                value={settings.timeFilter}
                options={[
                  { id: "all", label: "All" },
                  { id: "week", label: "Week" },
                  { id: "month", label: "Month" },
                ]}
                onChange={(val) => updateSetting("timeFilter", val as any)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
