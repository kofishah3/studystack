import React from "react";
import { LucideIcon } from "lucide-react";
import { MetricSkeleton } from "../ui/SkeletonCard";

interface ProfileMetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning";
  isLoading?: boolean;
  className?: string;
}

export default function ProfileMetricCard({
  value,
  label,
  icon: Icon,
  variant = "default",
  isLoading,
  className = "",
}: ProfileMetricCardProps) {
  let bgColor = "bg-surface/40 hover:bg-surface/80";
  let textColor = "text-text";
  let labelColor = "text-muted";
  let borderColor = "border-border";
  let iconColor = "text-primary-500/60";

  if (variant === "success") {
    borderColor = "border-green-500/20";
    textColor = "text-green-600 dark:text-green-400";
    labelColor = "text-green-600/70 dark:text-green-400/70";
    bgColor = "bg-green-500/5 hover:bg-green-500/10";
    iconColor = "text-green-500/60";
  } else if (variant === "warning") {
    borderColor = "border-yellow-500/20";
    textColor = "text-yellow-600 dark:text-yellow-400";
    labelColor = "text-yellow-600/70 dark:text-yellow-400/70";
    bgColor = "bg-yellow-500/5 hover:bg-yellow-500/10";
    iconColor = "text-yellow-500/60";
  }

  if (isLoading) {
    return <MetricSkeleton className={className} />;
  }

  return (
    <div
      className={`flex flex-row items-center p-3 sm:p-4 rounded-2xl flex-1 border ${borderColor} ${bgColor} transition-all duration-300 group cursor-default hover:shadow-md hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        <div
          className={`p-1.5 sm:p-2 rounded-xl bg-background border border-border group-hover:border-primary-500/30 transition-colors duration-300 ${iconColor}`}
        >
          <Icon size={18} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-lg sm:text-2xl font-bold font-sora tracking-tight ${textColor} group-hover:text-primary-500 transition-colors duration-300`}
          >
            {value}
          </span>
          <span
            className={`text-[10px] sm:text-xs font-semibold tracking-tight ${labelColor}`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
