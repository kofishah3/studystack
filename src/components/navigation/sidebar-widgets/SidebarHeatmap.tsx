"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export default function SidebarHeatmap() {
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

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

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800/50";
    if (count === 1) return "bg-primary-200 dark:bg-primary-900/40";
    if (count === 2) return "bg-primary-300 dark:bg-primary-700/60";
    if (count === 3) return "bg-primary-500 dark:bg-primary-600/80";
    return "bg-primary-500 dark:bg-primary-600";
  };

  if (loading || heatmapData.length === 0) return null;

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

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-13 gap-[2px]">
          {heatmapData.map((day, i) => (
            <div
              key={i}
              className={`w-full aspect-square rounded-xs ${getIntensityColor(day.count)} transition-colors 
              hover:ring-1 hover:ring-primary-300 cursor-help`}
              title={`${day.date}: ${day.count} acts`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-gray-500 font-medium">
            Last 90 Days
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-500">Less</span>
            <div className="flex gap-[2px]">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-1.5 h-1.5 rounded-[1px] ${getIntensityColor(level)}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
