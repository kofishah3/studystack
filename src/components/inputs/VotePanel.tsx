"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export type VoteType = "up" | "down" | null;

type VoteProps = {
    voteUpCount: number,
    voteDownCount: number,

    targetID: string,
    targetType: string,

    initialUserVote?: VoteType;
}

export default function VotePanel({
    voteUpCount,
    voteDownCount,
    targetID,
    targetType,
    initialUserVote = null,
}: VoteProps) {
    const [voteUp, setVoteUp] = useState(voteUpCount);
    const [voteDown, setVoteDown] = useState(voteDownCount);
    const [userVote, setUserVote] = useState<VoteType>(initialUserVote);
    const [loading, setLoading] = useState(false);

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