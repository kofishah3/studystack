"use client";
import { useState } from "react";
import VotePanel, { VoteType } from "../inputs/VotePanel";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";

export interface AnswerProps {
  id: string;
  credibilityScore: number;
  authorName: string;
  body: string;

  createdAt: string;
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
  onReply?: (content: string) => Promise<void>;
}

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
  onReply,
}: AnswerProps) {
  const [upVotes, setUpVotes] = useState(totalUpVotes);
  const [downVotes, setDownVotes] = useState(totalDownVotes);
  const [resolved, setResolved] = useState(isResolved);
  const [isReplying, setIsReplying] = useState(false);

  const reliabilityLabel =
    credibilityScore < 40
      ? "Low Reliability"
      : credibilityScore < 70
        ? "Moderate Reliability"
        : "High Reliability";

  return (
    <div
      id={`answer-card-container-${id}`}
      className="flex flex-col gap-2 w-full"
    >
      <div
        id={`answer-card-${id}`}
        className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex gap-3 transition-colors ${
          resolved
            ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 pt-0.5" id={`answer-vote-panel-${id}`}>
          <VotePanel
            voteUpCount={upVotes}
            voteDownCount={downVotes}
            targetID={id}
            targetType="question"
            initialUserVote={userVote}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <UserMeta 
                name={authorName}
                createdAt={new Date(createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`text-xs px-2 py-0.5 rounded font-medium ${getCredibilityStyles(credibilityScore)}`}
                >
                  {reliabilityLabel} ({credibilityScore}%)
                </div>

                {resolved && (
                  <div className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Resolved
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 -mt-1" id={`answer-actions-${id}`}>
              <ActionMenu />
            </div>
          </div>

          <p id={`answer-body-${id}`} className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {body}
          </p>

          {mediaURLs && mediaURLs.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap" id={`answer-media-${id}`}>
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
                ),
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mt-1">
            <button
              id={`answer-reply-btn-${id}`}
              onClick={() => setIsReplying(!isReplying)}
              className="text-[10px] font-bold text-gray-400 hover:text-primary-500 uppercase tracking-wider transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {isReplying && onReply && (
        <div 
          id={`answer-reply-input-wrapper-${id}`}
          className="ml-12 mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <CommentInput
            id={`answer-reply-input-${id}`}
            placeholder={`Reply to ${authorName}...`}
            onSubmit={async (content) => {
              await onReply(content);
              setIsReplying(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
