"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { usePrompt } from "@/contexts/PromptContext";
import VotePanel, { VoteType } from "../inputs/VotePanel";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import CommentInput from "../inputs/CommentInput";
import { CommentCard, type CommentData, buildCommentTree } from "./CommentCard";
import { CornerDownRight } from "lucide-react";
import type { AnswerID, QuestionID, UserID } from "@/types/database";
import { MediaCarousel } from "../ui/MediaCarousel";

export interface AnswerProps {
  answer_id: AnswerID;
  user_id: UserID;
  question_id: QuestionID;
  content: string;
  media_urls: { type: "image" | "video"; url: string }[];
  is_accepted: boolean;
  created_at: string;

  author_name: string;
  author_profile_url?: string | null;
  author_institution?: string;
  author_degree_program?: string;
  author_credibility_score: number;

  upvotes?: number;
  downvotes?: number;

  comments?: CommentData[];

  userVote: VoteType;
  hideComments?: boolean;

  onReply?: (content: string, parentCommentId?: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onDelete?: (answerId: number) => Promise<void>;
}

function getCredibilityStyles(score: number) {
  if (score < 40)
    return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  if (score < 70)
    return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
}


export default function AnswerCard({
  answer_id,
  user_id,
  content,
  media_urls = [],
  is_accepted,
  created_at,
  author_name,
  author_profile_url,
  author_institution,
  author_degree_program,
  author_credibility_score,
  comments = [],
  userVote,
  hideComments = false,
  onReply,
  onDeleteComment,
  onDelete,
  upvotes = 0,
  downvotes = 0,
}: AnswerProps) {
  const [resolved] = useState(is_accepted);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { showPrompt } = usePrompt();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.user_id);
      } catch (e) {}
    }
  }, []);

  const handleDeleteClick = () => {
    showPrompt({
      title: "Delete Answer?",
      description:
        "Are you sure you want to delete this answer? This cannot be undone.",
      icon: Trash2,
      type: "confirmation",
      onAccept: async () => {
        onDelete?.(answer_id);
      },
    });
  };

  const builtReplies = buildCommentTree(comments);
  const replyCount = builtReplies.length;
  const idStr = answer_id ? answer_id.toString() : "";

  const reliabilityLabel =
    author_credibility_score < 40
      ? "Low Reliability"
      : author_credibility_score < 70
        ? "Moderate Reliability"
        : "High Reliability";

  return (
    <div
      id={`answer-card-container-${idStr}`}
      className="flex flex-col gap-2 w-full"
    >
      <div
        id={`answer-card-${idStr}`}
        className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex gap-3 transition-colors ${
          resolved
            ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div
          className="flex flex-col items-center gap-0.5 pt-0.5"
          id={`answer-vote-panel-${idStr}`}
        >
          <VotePanel
            voteUpCount={upvotes}
            voteDownCount={downvotes}
            targetID={idStr}
            targetType="answer"
            initialUserVote={userVote}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <UserMeta
                name={author_name}
                avatarUrl={author_profile_url ?? undefined}
                institution={author_institution}
                degreeProgram={author_degree_program}
                createdAt={new Date(created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`text-xs px-2 py-0.5 rounded font-medium ${getCredibilityStyles(author_credibility_score)}`}
                >
                  {reliabilityLabel} ({author_credibility_score}%)
                </div>

                {resolved && (
                  <div className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Resolved
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 -mt-1 flex items-center gap-1" id={`answer-actions-${idStr}`}>
              {currentUserId === user_id && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 text-gray-400 transition-colors"
                  title="Delete answer"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <ActionMenu />
            </div>
          </div>

          <p
            id={`answer-body-${idStr}`}
            className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {content}
          </p>

          {media_urls.length > 0 && <MediaCarousel mediaURLs={media_urls} />}

          {!hideComments && (
            <div className="flex items-center gap-4 mt-1">
              {onReply && (
                <button
                  id={`answer-reply-btn-${idStr}`}
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-[10px] font-bold text-gray-400 hover:text-primary-500 uppercase tracking-wider transition-colors"
                >
                  {isReplying ? "Cancel" : "Reply"}
                </button>
              )}
              {replyCount > 0 && (
                <button
                  id={`answer-toggle-replies-btn-${idStr}`}
                  onClick={() => setShowReplies((v) => !v)}
                  className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {showReplies
                    ? `▲ Hide replies`
                    : `▼ ${replyCount} repl${replyCount === 1 ? "y" : "ies"}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!hideComments && isReplying && onReply && (
        <div
          id={`answer-reply-input-wrapper-${idStr}`}
          className="ml-12 mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <CommentInput
            id={`answer-reply-input-${idStr}`}
            placeholder={`Reply to ${author_name}...`}
            onSubmit={async (content) => {
              await onReply(content, undefined);
              setIsReplying(false);
            }}
          />
        </div>
      )}

      {!hideComments && showReplies && replyCount > 0 && (
        <div
          className="ml-12 sm:ml-14 flex flex-col gap-2 relative"
          id={`answer-replies-${idStr}`}
        >
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex items-center gap-1.5 px-1">
            <CornerDownRight
              size={12}
              strokeWidth={2.5}
              className="text-gray-400"
            />
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Replies
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {builtReplies.map((comment) => (
              <CommentCard
                key={comment.comment_id}
                {...comment}
                replies={comment.replies ?? []}
                onReply={onReply}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}