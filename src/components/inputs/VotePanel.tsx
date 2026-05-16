"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export type VoteType = "up" | "down" | null;

type VoteProps = {
  voteUpCount?: number;
  voteDownCount?: number;
  targetID: string;
  targetType: string;
  initialUserVote?: VoteType;
};

export default function VotePanel({
  voteUpCount: initialUp = 0,
  voteDownCount: initialDown = 0,
  targetID,
  targetType,
  initialUserVote = null,
}: VoteProps) {
  const { showToast } = useToast();
  const [voteUp, setVoteUp] = useState(initialUp);
  const [voteDown, setVoteDown] = useState(initialDown);
  const [userVote, setUserVote] = useState<VoteType>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(() => {
    if (!targetID) return;

    const token = localStorage.getItem("token");
    fetch(`/api/interactions?target_type=${targetType}&target_id=${targetID}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.upvotes === "number") setVoteUp(data.upvotes);
        if (typeof data.downvotes === "number") setVoteDown(data.downvotes);
        if (data.userInteraction) {
          const v = data.userInteraction.value;
          setUserVote(v > 0 ? "up" : v < 0 ? "down" : null);
        } else {
          setUserVote(null);
        }
      })
      .catch(() => {});
  }, [targetID, targetType]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const submitVote = async (value: 1 | -1 | 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast({
          type: "error",
          title: "Login Required",
          message: "Please log in to vote.",
        });
        fetchCounts();
        return;
      }

      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interaction_type: "react",
          value,
          target_type: targetType,
          target_id: targetID,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to vote");
      }
    } catch (err: any) {
      console.error("Vote failed", err);
      showToast({
        type: "error",
        title: "Action failed",
        message: err.message || "Something went wrong. Please try again.",
      });
      fetchCounts();
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userVote === "up") {
      setVoteUp((v) => v - 1);
      setUserVote(null);
      submitVote(0);
    } else if (userVote === "down") {
      setVoteDown((v) => v - 1);
      setVoteUp((v) => v + 1);
      setUserVote("up");
      submitVote(1);
    } else {
      setVoteUp((v) => v + 1);
      setUserVote("up");
      submitVote(1);
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userVote === "down") {
      setVoteDown((v) => v - 1);
      setUserVote(null);
      submitVote(0);
    } else if (userVote === "up") {
      setVoteUp((v) => v - 1);
      setVoteDown((v) => v + 1);
      setUserVote("down");
      submitVote(-1);
    } else {
      setVoteDown((v) => v + 1);
      setUserVote("down");
      submitVote(-1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpvote}
        disabled={loading}
        aria-label="Upvote"
        className={`transition ${
          userVote === "up"
            ? "text-blue-500"
            : "text-gray-500 hover:text-blue-400"
        } disabled:opacity-40`}
      >
        <ArrowUp size={18} />
      </button>

      <span className="text-sm font-semibold">{voteUp - voteDown}</span>

      <button
        onClick={handleDownvote}
        disabled={loading}
        aria-label="Downvote"
        className={`transition ${
          userVote === "down"
            ? "text-red-500"
            : "text-gray-500 hover:text-red-400"
        } disabled:opacity-40`}
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
}
