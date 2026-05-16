import React from "react";
import { LucideIcon } from "lucide-react";
import { MetricSkeleton } from "../ui/SkeletonCard";

interface ProfileMetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export default function ProfileMetricCard({
  value,
  label,
  icon: Icon,
  isLoading,
  className = "",
}: ProfileMetricCardProps) {
  const bgColor = "bg-surface/40 hover:bg-surface/80";
  const textColor = "text-text";
  const labelColor = "text-muted";
  const borderColor = "border-border";
  const iconColor = "text-primary-500/60";

  if (isLoading) {
    return <MetricSkeleton className={className} />;
  }

  return (
    <div
      className={`flex flex-row items-center p-3 sm:p-4 rounded-2xl flex-1 
        border ${borderColor} ${bgColor} transition-all duration-300 group 
        cursor-default hover:shadow-sm hover:scale-105 ${className}`}
    >
      <div className="flex flex-row items-center gap-5 sm:gap-4">
        <div
          className={`rounded-lg bg-transparent transition-colors duration-300 ${iconColor}`}
        >
          <Icon size={25} strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-lg sm:text-2xl font-bold font-sora tracking-tight ${textColor} 
            group-hover:text-primary-500 transition-colors duration-300`}
          >
            {value}
          </span>
          <span
            className={`text-xs sm:text-xs font-semibold tracking-tight ${labelColor}`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
