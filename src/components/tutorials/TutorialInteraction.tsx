"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import HelpfulVoteButtons from "@/components/ui/HelpfulVoteButtons";
import type { VoteDirection } from "@/components/ui/HelpfulVoteButtons";

interface TutorialInteractionProps {
  tutorialId: string;
  initialAvgRating: number;
  initialTotalInteractions: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserRating?: number;
  initialUserVote?: "up" | "down" | null;
  onUpdate?: () => void;
}

export default function TutorialInteraction({
  tutorialId,
  initialUpvotes,
  initialDownvotes,
  initialUserRating = 0,
  initialUserVote = null,
  onUpdate,
}: TutorialInteractionProps) {
  const { showToast } = useToast();
  const [userRating, setUserRating] = useState(initialUserRating);
  const [userVote, setUserVote] = useState<VoteDirection>(initialUserVote);
  const [upCount, setUpCount] = useState(initialUpvotes);
  const [downCount, setDownCount] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);

  const handleInteraction = async (
    type: "rating" | "react",
    value: number,
    voteType?: "up" | "down",
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token && type === "rating") {
        showToast({
          type: "error",
          title: "Login Required",
          message: "Please log in to rate this tutorial.",
        });
        return;
      }

      setLoading(true);
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interaction_type: type,
          value,
          target_type: "tutorial",
          target_id: tutorialId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${type}`);
      }

      if (type === "rating") {
        setUserRating(value);
        showToast({
          type: "success",
          title: "Rating saved",
          message: `You rated this tutorial ${value} stars!`,
        });
      } else if (type === "react") {
        if (value === 0) {
          if (userVote === "up") setUpCount((prev) => prev - 1);
          if (userVote === "down") setDownCount((prev) => prev - 1);
          setUserVote(null);
        } else if (value === 1) {
          setUpCount((prev) => prev + 1);
          if (userVote === "down") setDownCount((prev) => prev - 1);
          setUserVote("up");
        } else if (value === -1) {
          setDownCount((prev) => prev + 1);
          if (userVote === "up") setUpCount((prev) => prev - 1);
          setUserVote("down");
        }
      }

      onUpdate?.();
    } catch (error: any) {
      console.error(`${type} failed:`, error);
      showToast({
        type: "error",
        title: "Action failed",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      handleInteraction("react", 0);
    } else {
      handleInteraction("react", type === "up" ? 1 : -1, type);
    }
  };

  return (
    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          How would you rate this tutorial?
        </span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleInteraction("rating", star)}
              disabled={loading}
              className="p-1 group transition-transform active:scale-90 disabled:opacity-50"
            >
              <Star
                size={32}
                className={
                  star <= userRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold text-gray-500">
          Was this helpful?
        </span>
        <div className="flex items-center gap-4 py-2 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <HelpfulVoteButtons
            upCount={upCount}
            downCount={downCount}
            userVote={userVote}
            loading={loading}
            onVote={handleVote}
            variant="large"
          />
        </div>
      </div>
    </div>
  );
}
