"use client";
import { useState } from "react";
import VotePanel, { VoteType } from "../inputs/VotePanel";

export interface AnswerProps {
  id: string,
  credibilityScore: number;
  authorName: string;
  body: string;

  createdAt: string
  updatedAt?: string;

  mediaURLs?: { type: "image" | "video"; url: string }[];
  isResolved: boolean;

  totalComments: number;
  totalUpVotes: number;
  totalDownVotes: number;
  userVote: VoteType;

  onVoteUp?: (id: string) => void;
  onVoteDown?: (id: string) => void;
  onResolved?: (id: string) => void;
  onHelpful?: (id: string) => void;
};

function getCredibilityStyles(score: number) {
  if (score < 40) {
    return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  } else if (score < 70) {
    return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
  } else {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  }
}

export default function AnswerCard({
  id,
  credibilityScore,
  authorName,
  body,

  createdAt,
  updatedAt,

  mediaURLs,

  totalComments,
  totalUpVotes,
  totalDownVotes,
  isResolved,
  userVote,

  onVoteUp,
  onVoteDown,
  onResolved,
  onHelpful,
}: AnswerProps) {
  const [ upVotes, setUpVotes ] = useState(totalUpVotes);
  const [ downVotes, setDownVotes ] = useState(totalDownVotes);
  const [resolved, setResolved] = useState(isResolved);

  const reliabilityLabel =
    credibilityScore < 40
      ? "Low Reliability"
      : credibilityScore < 70
      ? "Moderate Reliability"
      : "High Reliability";

  return (
    <div 
      className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex gap-3 transition-colors ${
        resolved
          ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* COLUMN 1: VOTE BUTTON */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <VotePanel
          voteUpCount={upVotes}
          voteDownCount={downVotes}
          targetID={id}
          targetType="question"
          initialUserVote={userVote}
        />
      </div>

      {/* COLUMN 2: CONTENT */}
      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          {/* Credibility Score Badge */}
          <div className={`text-xs px-2 py-0.5 rounded font-medium ${getCredibilityStyles(credibilityScore)}`}>
            {reliabilityLabel} ({credibilityScore}%)
          </div>

          {/* Resolved Badge */}
          {resolved && (
            <div className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Resolved
            </div>
          )}
        </div>

        {/* Resolved Badge */}
        {resolved && (
          <div className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Resolved
          </div>
        )}

        {/* Body */}
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {body}
        </p>

        {/* Media */}
        {mediaURLs && mediaURLs.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {mediaURLs.map((m, i) =>
              m.type === "image" ? (
                <img
                  key={i}
                  src={m.url}
                  alt=""
                  className="h-24 rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                />
              ) : (
                <video
                  key={i}
                  src={m.url}
                  className="h-24 rounded-lg border border-gray-200 dark:border-gray-700"
                  controls
                  muted
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}