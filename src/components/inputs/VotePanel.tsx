"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

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
  const [voteUp, setVoteUp] = useState(initialUp);
  const [voteDown, setVoteDown] = useState(initialDown);
  const [userVote, setUserVote] = useState<VoteType>(initialUserVote);
  const [loading, setLoading] = useState(false);

  // Fetch real counts + current user's vote on mount
  useEffect(() => {
    if (!targetID) return;

    const token = localStorage.getItem("token");
    fetch(
      `/api/interactions?target_type=${targetType}&target_id=${targetID}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
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
      .catch(() => {
        // silently keep initial values on error
      });
  }, [targetID, targetType]);

  const submitVote = async (value: 1 | -1 | 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interaction_type: "react",
          value,
          target_type: targetType,
          target_id: targetID,
        }),
      });
    } catch (err) {
      console.error("Vote failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = () => {
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

  const handleDownvote = () => {
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