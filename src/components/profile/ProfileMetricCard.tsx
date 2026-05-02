import React from "react";

interface ProfileMetricCardProps {
  value: string | number;
  label: string;
  variant?: "default" | "success" | "warning";
}

export default function ProfileMetricCard({
  value,
  label,
  variant = "default",
}: ProfileMetricCardProps) {
  let bgColor = "bg-surface border border-border";
  let textColor = "text-text";
  let labelColor = "text-muted";

  if (variant === "success") {
    bgColor = "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800";
    textColor = "text-green-900 dark:text-green-300";
    labelColor = "text-green-700 dark:text-green-400";
  } else if (variant === "warning") {
    bgColor = "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800";
    textColor = "text-yellow-900 dark:text-yellow-300";
    labelColor = "text-yellow-700 dark:text-yellow-400";
  } else {
    bgColor = "bg-muted/5 border border-transparent";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-xl flex-1 min-w-[120px] ${bgColor}`}
    >
      <span className={`text-2xl font-bold font-sora ${textColor}`}>
        {value}
      </span>
      <span className={`text-xs mt-1 ${labelColor}`}>{label}</span>
    </div>
  );
}
