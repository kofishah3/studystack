"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useTooltip } from "@/contexts/TooltipContext";

const DAYS = 91;
const COLS = 13;

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getIntensityColor(count: number) {
  if (count === 0) return "bg-gray-100 dark:bg-gray-800/50";
  if (count === 1) return "bg-primary-200 dark:bg-primary-900/50";
  if (count === 2) return "bg-primary-300 dark:bg-primary-700/60";
  if (count === 3) return "bg-primary-500 dark:bg-primary-500/70";
  return "bg-primary-700 dark:bg-primary-300";
}

export default function SidebarHeatmap() {
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { showTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    const fetchHeatmap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/user/heatmap", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          setHeatmapData(data);
        }
      } catch (e) {
        console.error("Failed to load heatmap", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  if (loading || heatmapData.length === 0) return null;
  const padded: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const found = heatmapData.find((h) => h.date === iso);
    padded.push({ date: iso, count: found?.count ?? 0 });
  }

  const columns: { date: string; count: number }[][] = [];
  for (let c = 0; c < COLS; c++) {
    columns.push(padded.slice(c * 7, c * 7 + 7));
  }

  const monthLabels: { col: number; label: string }[] = [];
  columns.forEach((col, ci) => {
    const firstOfMonth = col.find((d) => new Date(d.date).getDate() <= 7);
    if (firstOfMonth) {
      const month = new Date(firstOfMonth.date).toLocaleString("en-US", {
        month: "short",
      });
      if (
        !monthLabels.length ||
        monthLabels[monthLabels.length - 1].label !== month
      ) {
        monthLabels.push({ col: ci, label: month });
      }
    }
  });

  return (
    <div
      id="heatmap-widget"
      className="w-full flex flex-col gap-2 bg-surface p-3 rounded-xl border border-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
          <Activity size={14} className="text-primary-500" />
          My Activity
        </h3>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex gap-[3px]">
          {columns.map((_, ci) => {
            const label = monthLabels.find((m) => m.col === ci);
            return (
              <div
                key={ci}
                className="flex-1 text-[8px] text-gray-400 font-medium truncate"
              >
                {label?.label ?? ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px]">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px] flex-1">
              {col.map((day, di) => (
                <div
                  key={di}
                  className={`w-full aspect-square rounded-[2px] ${getIntensityColor(day.count)} 
                  transition-colors hover:ring-1 hover:ring-primary-400 cursor-default`}
                  onMouseEnter={(e) =>
                    showTooltip(
                      `${day.count} act${day.count !== 1 ? "s" : ""} · ${formatDate(day.date)}`,
                      e,
                    )
                  }
                  onMouseLeave={hideTooltip}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[9px] text-gray-400 font-medium">
          Last 90 days
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gray-400">Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-[2px] ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}
