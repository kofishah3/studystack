"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import VotePanel, { VoteType } from "../inputs/VotePanel";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import { CommentCard, type CommentCardProps } from "./CommentCard";
import CreateComment from "../inputs/CreateCards/CreateComment";
import TextButton from "../inputs/textbutton";

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
  comments?: CommentCardProps[];
  questionId: string;
  /** When true, hides the Comments button entirely (used in preview/QuestionCard context) */
  hideComments?: boolean;
  /** When true, aligns the Comments button to the right (used in individual question page) */
  commentsOnRight?: boolean;

  onVoteUp?: (id: string) => void;
  onVoteDown?: (id: string) => void;
  onResolved?: (id: string) => void;
  onHelpful?: (id: string, value: 1 | -1) => void;
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
                    i === index
                      ? "w-4 h-2 bg-white"
                      : "w-2 h-2 bg-white/30"
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
          style={{ height: item.type === "video" ? "380px" : "260px" }}
          onClick={item.type === "image" ? () => setLightboxOpen(true) : undefined}
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt=""
              className="w-full object-contain cursor-pointer"
            />
          ) : (
            <video
              src={item.url}
              className="w-full h-full object-contain"
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
  id,
  credibilityScore,
  authorName,
  body,
  createdAt,
  mediaURLs = [],
  totalUpVotes,
  totalDownVotes,
  isResolved,
  userVote,
  comments = [],
  questionId,
  hideComments = false,
  commentsOnRight = false,
  onHelpful,
}: AnswerProps) {
  const [upVotes] = useState(totalUpVotes);
  const [downVotes] = useState(totalDownVotes);
  const [resolved] = useState(isResolved);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] =
    useState<CommentCardProps[]>(comments);

  const [helpfulVote, setHelpfulVote] = useState<"up" | "down" | null>(null);
  const helpfulScore =
    helpfulVote === "up" ? 1 : helpfulVote === "down" ? -1 : 0;

  const reliabilityLabel =
    credibilityScore < 40
      ? "Low Reliability"
      : credibilityScore < 70
        ? "Moderate Reliability"
        : "High Reliability";

  function handleHelpful(type: "up" | "down") {
    const next = helpfulVote === type ? null : type;
    setHelpfulVote(next);
    if (next === "up") onHelpful?.(id, 1);
    else if (next === "down") onHelpful?.(id, -1);
  }

  function handleCommentSuccess(raw: Record<string, unknown>) {
    setLocalComments((prev) => [
      ...prev,
      {
        comment_id: raw.comment_id as number,
        authorName: (raw.author_name as string) ?? "You",
        createdAt: (raw.created_at as string) ?? new Date().toISOString(),
        body: raw.content as string,
        questionId,
        answerId: Number(id),
      },
    ]);
    setShowComments(true);
  }

  const commentsLabel = showComments
    ? "Hide comments"
    : `${localComments.length > 0 ? localComments.length + " " : ""}Comment${localComments.length !== 1 ? "s" : ""}`;

  return (
    <div
      className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex gap-3 transition-colors ${
        resolved
          ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Vote panel */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <VotePanel
          voteUpCount={upVotes}
          voteDownCount={downVotes}
          targetID={id}
          targetType="question"
          initialUserVote={userVote}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2 min-w-0">
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

          {/* Right: Helpful? + thumbs + ActionMenu */}
          <div className="shrink-0 flex items-center gap-1.5 -mt-0.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium select-none">
              Helpful?
            </span>

            {helpfulVote !== null && (
              <span
                className={`text-xs font-bold tabular-nums ${
                  helpfulScore > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {helpfulScore > 0 ? `+${helpfulScore}` : `${helpfulScore}`}
              </span>
            )}

            <button
              onClick={() => handleHelpful("up")}
              aria-label="Mark as helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                helpfulVote === "up"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <ThumbsUp size={14} strokeWidth={2} />
            </button>

            <button
              onClick={() => handleHelpful("down")}
              aria-label="Mark as not helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                helpfulVote === "down"
                  ? "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 dark:hover:text-red-400"
              }`}
            >
              <ThumbsDown size={14} strokeWidth={2} />
            </button>

            <div className="-mr-1">
              <ActionMenu />
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {body}
        </p>

        {/* Media carousel */}
        {mediaURLs.length > 0 && <MediaCarousel mediaURLs={mediaURLs} />}

        {/* Action row — hidden when hideComments, right-aligned when commentsOnRight */}
        {!hideComments && (
          <div
            className={`flex items-center pt-2 border-t border-gray-100 dark:border-gray-800 mt-1 ${
              commentsOnRight ? "justify-end" : ""
            }`}
          >
            <TextButton
              label={commentsLabel}
              textColor="gray-500"
              hoverColor="primary-700"
              selectedColor="primary-700"
              isSelected={showComments}
              onClick={() => setShowComments((v) => !v)}
            />
          </div>
        )}

        {/* Comments */}
        {!hideComments && showComments && (
          <div className="flex flex-col gap-2 mt-1">
            {localComments.map((c, i) => (
              <CommentCard key={c.comment_id ?? i} {...c} />
            ))}
            <div className="mt-1">
              <CreateComment
                questionId={questionId}
                answerId={Number(id)}
                placeholder="Write a comment on this answer…"
                onSuccess={handleCommentSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}