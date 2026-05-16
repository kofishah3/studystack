"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

export type VoteDirection = "up" | "down" | null;

interface HelpfulVoteButtonsProps {
  upCount: number;
  downCount: number;
  userVote: VoteDirection;
  loading?: boolean;
  onVote: (direction: "up" | "down") => void;
  variant?: "compact" | "large";
}

export default function HelpfulVoteButtons({
  upCount,
  downCount,
  userVote,
  loading = false,
  onVote,
  variant = "compact",
}: HelpfulVoteButtonsProps) {
  const isCompact = variant === "compact";
  const iconSize = isCompact ? 13 : 20;
  const btnBase = isCompact
    ? "p-1.5 rounded-lg flex items-center gap-1"
    : "p-2 rounded-xl flex items-center gap-2 transition-all";
  const countClass = isCompact ? "text-[10px] font-bold" : "text-sm font-bold";

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onVote("up");
        }}
        disabled={loading}
        aria-label="Upvote"
        className={`${btnBase} ${
          userVote === "up"
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        } disabled:opacity-50`}
      >
        <ThumbsUp
          size={iconSize}
          className={userVote === "up" ? "fill-current" : ""}
        />
        {(!isCompact || upCount > 0) && (
          <span className={countClass}>{upCount}</span>
        )}
      </button>

      {!isCompact && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />}

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onVote("down");
        }}
        disabled={loading}
        aria-label="Downvote"
        className={`${btnBase} ${
          userVote === "down"
            ? "bg-red-100 text-red-500 dark:bg-red-950/50 dark:text-red-400"
            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        } disabled:opacity-50`}
      >
        <ThumbsDown
          size={iconSize}
          className={userVote === "down" ? "fill-current" : ""}
        />
        {(!isCompact || downCount > 0) && (
          <span className={countClass}>{downCount}</span>
        )}
      </button>
    </>
  );
}
