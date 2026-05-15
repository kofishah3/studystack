"use client";

import React from "react";

export default function SkeletonCard() {
  return (
    <div
      className="
      w-full p-3.5
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
      animate-pulse"
    >
      <div className="flex gap-4">
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-14 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-shimmer" />
          <div className="w-8 h-2 mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-full" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-[85%] animate-shimmer" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-1/4" />
            </div>

            <div className="shrink-0 w-28 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-shimmer" />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 animate-shimmer" />
            <div className="flex items-center gap-1.5">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-20 animate-shimmer" />
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-md w-16" />
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-1" />
              <div className="h-5 bg-gray-100 dark:bg-gray-800/80 rounded-md w-24 animate-shimmer" />
            </div>
          </div>

          <div className="space-y-2 mt-1">
            <div className="h-3 bg-gray-100 dark:bg-gray-800/70 rounded-md w-full animate-shimmer" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800/70 rounded-md w-[95%] animate-shimmer" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800/70 rounded-md w-[40%] animate-shimmer" />
          </div>
        </div>

        <div className="shrink-0 pt-1">
          <div className="w-1 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function MetricSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-row items-center p-4 rounded-2xl flex-1 border border-border bg-surface/40 animate-pulse ${className}`}
    >
      <div className="flex flex-row items-center gap-4 w-full">
        <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 w-10 h-10 animate-shimmer" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-12 animate-shimmer" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-16 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
