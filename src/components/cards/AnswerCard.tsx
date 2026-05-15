"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import VotePanel, { VoteType } from "../inputs/VotePanel";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import CommentInput from "../inputs/CommentInput";
import { CommentCard, type CommentData, buildCommentTree } from "./CommentCard";
import { CornerDownRight } from "lucide-react";
import type { AnswerID, QuestionID, UserID } from "@/types/database";

// ── AnswerProps ───────────────────────────────────────────────────────────────
// Mirrors the Answers table columns exactly, plus join fields from the
// users table (author_*) and UI-only extras (userVote, hideComments, callbacks).
export interface AnswerProps {
  // Answers table columns
  answer_id: AnswerID;
  user_id: UserID;
  question_id: QuestionID;
  content: string;
  media_urls: { type: "image" | "video"; url: string }[];
  is_accepted: boolean;
  created_at: string; // ISO string from JSON — Date on the DB side

  // Join fields from users table
  author_name: string;
  author_profile_url?: string | null;
  author_credibility_score: number;

  // Nested join — comments on this answer
  comments?: CommentData[];

  // UI-only
  userVote: VoteType;
  hideComments?: boolean;

  // Callbacks
  onReply?: (content: string, parentCommentId?: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

function getCredibilityStyles(score: number) {
  if (score < 40)
    return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  if (score < 70)
    return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  media,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  media: { type: "image" | "video"; url: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = media[index];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="absolute -top-9 left-0 text-xs text-white/50 font-medium select-none">
          {index + 1} / {media.length}
        </span>

        <button
          onClick={onClose}
          className="absolute -top-9 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X size={22} />
        </button>

        <div className="w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[78vh]">
          {current.type === "image" ? (
            <img
              src={current.url}
              alt=""
              className="max-h-[78vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={current.url}
              className="max-h-[78vh] max-w-full"
              controls
              autoPlay
            />
          )}
        </div>

        {media.length > 1 && (
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1.5">
              {media.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all ${
                    i === index ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onNext}
              disabled={index === media.length - 1}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MediaCarousel ─────────────────────────────────────────────────────────────
function MediaCarousel({
  mediaURLs,
}: {
  mediaURLs: { type: "image" | "video"; url: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (mediaURLs.length === 0) return null;

  const item = mediaURLs[current];

  return (
    <>
      <div className="mt-2 w-full flex flex-col gap-2">
        <div
          className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group"
          onClick={
            item.type === "image" ? () => setLightboxOpen(true) : undefined
          }
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt=""
              className="w-full h-auto max-h-[300px] object-cover cursor-pointer"
            />
          ) : (
            <video
              src={item.url}
              className="w-full h-[380px] object-contain"
              controls
            />
          )}

          {item.type === "image" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl pointer-events-none">
              <div className="bg-black/50 rounded-full p-2.5">
                <ZoomIn size={20} className="text-white" />
              </div>
            </div>
          )}

          {item.type === "video" && (
            <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-md font-medium pointer-events-none">
              Video
            </span>
          )}

          {mediaURLs.length > 1 && (
            <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-md font-medium pointer-events-none">
              {current + 1} / {mediaURLs.length}
            </span>
          )}
        </div>

        {mediaURLs.length > 1 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setCurrent((i) => Math.max(i - 1, 0))}
              disabled={current === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous file"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <div className="flex items-center gap-1.5">
              {mediaURLs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to file ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "w-4 h-2 bg-primary-500"
                      : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrent((i) => Math.min(i + 1, mediaURLs.length - 1))
              }
              disabled={current === mediaURLs.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next file"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          media={mediaURLs}
          index={current}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setCurrent((i) => Math.max(i - 1, 0))}
          onNext={() =>
            setCurrent((i) => Math.min(i + 1, mediaURLs.length - 1))
          }
        />
      )}
    </>
  );
}

// ── AnswerCard ────────────────────────────────────────────────────────────────
export default function AnswerCard({
  answer_id,
  content,
  media_urls = [],
  is_accepted,
  created_at,
  author_name,
  author_credibility_score,
  comments = [],
  userVote,
  hideComments = false,
  onReply,
  onDeleteComment,
}: AnswerProps) {
  const [resolved] = useState(is_accepted);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

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
            voteUpCount={0}
            voteDownCount={0}
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

            <div className="shrink-0 -mt-1" id={`answer-actions-${idStr}`}>
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
                  className="text-[10px] font-semibold text-primary-500 hover:text-primary-500 transition-colors"
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
