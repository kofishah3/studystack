"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type VoteType = "up" | "down" | null;

export default function VotePanel({ votes }: { votes: number}) {
    const [voteCount, setVoteCount] = useState(votes);
    const [userVote, setUserVote] = useState<VoteType>(null);

    const handleUpvote = () => {
        if (userVote === "up") {
            setVoteCount(voteCount - 1);
            setUserVote(null);
        }
        else if (userVote === "down") {
            setVoteCount(voteCount+2);
            setUserVote("up");
        }
        else {
            setVoteCount(voteCount + 1);
            setUserVote("up");
        }
    };

    const handleDownvote = () => {
        if (userVote === "down") {
            setVoteCount(voteCount + 1);
            setUserVote(null);
        }
        else if (userVote === "up") {
            setVoteCount(voteCount - 2);
            setUserVote("down");
        }
        else {
            setVoteCount(voteCount - 1);
            setUserVote("down")
        }
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                onClick={handleUpvote}
                className={`transition ${
                    userVote === "up"
                    ? "text-blue-500"
                    : "text-gray-500 hover:text-blue-400"
                }`}
            >
                <ArrowUp size={18} />
            </button>

            <span className="text-sm font-semibold">
                {voteCount}
            </span>

            <button
                onClick={handleDownvote}
                className={`transition ${
                    userVote === "down"
                    ? "text-blue-500"
                    : "text-gray-500 hover:text-blue-400"
                }`}
            >
                <ArrowDown size={18} />
            </button>

        </div>
    );
}