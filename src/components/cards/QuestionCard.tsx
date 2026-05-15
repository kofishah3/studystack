"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/Tag";
import type { AnswerProps } from "./AnswerCard";
import AnswerCard from "./AnswerCard";
import FullButton from "../inputs/FullButton";
import CreateAnswer from "../inputs/CreateCards/CreateAnswer";
import CreateComment from "../inputs/CreateCards/CreateComment";

export type QuestionProps = {
  id: string;
  demandRate: number;
  questionTitle: string;
  profileURL?: string;
  author: string;
  subjectTag?: string[];
  category?: string;
  createdAt: string;
  updatedAt?: string;
  body: string;
  answers?: AnswerProps[];
  totalUpVotes?: number;
  totalDownVotes?: number;
  isResolved?: boolean;
  resolvedAnswer?: AnswerProps;
  onCreateTutorial?: (id: string) => void;
  mode?: "preview" | "full";
  onAnswerPosted?: (answer: Record<string, unknown>) => void;
  onCommentPosted?: (comment: Record<string, unknown>) => void;
};

type ComposerTab = "answer" | "comment";

export default function QuestionCard({
  id,
  demandRate,
  questionTitle,
  profileURL,
  author,
  subjectTag = [],
  category,
  createdAt,
  updatedAt,
  body,
  answers = [],
  isResolved = false,
  resolvedAnswer,
  mode = "preview",
  onAnswerPosted,
  onCommentPosted,
  onCreateTutorial,
}: QuestionProps) {
  const [composerTab, setComposerTab] = useState<ComposerTab>("answer");
  const [helpfulVote, setHelpfulVote] = useState<"up" | "down" | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Defined at top level — never remount, always attached
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── derived ────────────────────────────────────────────────────────────────
  const demandColor =
    demandRate >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : demandRate >= 40
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  const topAnswer =
    answers.length > 0
      ? [...answers].sort((a, b) => b.totalUpVotes - a.totalUpVotes)[0]
      : null;

  const featuredAnswer: AnswerProps | null = isResolved
    ? (resolvedAnswer ?? topAnswer)
    : topAnswer;

  const tags = [
    ...(category ? category.split(",").map((s) => s.trim()) : []),
    ...subjectTag,
  ].filter((tag, i, self) => tag && self.indexOf(tag) === i);

  // ── handlers ───────────────────────────────────────────────────────────────
  function handleShare() {
    const url = `${window.location.origin}/questions/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  function handleHelpful(type: "up" | "down") {
    setHelpfulVote((prev) => (prev === type ? null : type));
  }

  function handleComposerTab(tab: ComposerTab) {
    setComposerTab(tab);
    setTimeout(() => {
      if (tab === "answer") answerTextareaRef.current?.focus();
      else commentTextareaRef.current?.focus();
    }, 0);
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`
        w-full max-w-7xl mx-auto
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
        ${mode === "preview" ? "hover:shadow-md transition-shadow" : ""}
        flex flex-col overflow-hidden
      `}
      id={`question-card-${id}`}
    >
      {/* ── Section 1: Question ─────────────────────────────────────────────── */}
      <div className="p-3.5">
        <div className="flex gap-3 sm:gap-4">
          {/* Demand badge */}
          <div className="shrink-0 flex flex-col items-center self-stretch">
            <div
              className={`flex flex-col items-center justify-center w-10 sm:w-14 h-full rounded-lg border text-center font-bold ${demandColor}`}
            >
              <span className="text-[10px] sm:text-xs text-current opacity-60 leading-none mb-0.5">
                DMD
              </span>
              <span className="text-sm sm:text-lg leading-none">{demandRate}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {mode === "full" ? (
                  <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-base sm:text-lg">
                    {questionTitle}
                  </h2>
                ) : (
                  <Link href={`/questions/${id}`} className="group">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-sm group-hover:text-primary-700 transition-colors">
                      {questionTitle}
                    </h2>
                  </Link>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1 mt-0.5">
                <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500 font-medium select-none">
                  Helpful?
                </span>
                <button
                  onClick={() => handleHelpful("up")}
                  aria-label="Helpful"
                  className={`p-1.5 rounded-lg transition-colors ${
                    helpfulVote === "up"
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  <ThumbsUp size={13} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleHelpful("down")}
                  aria-label="Not helpful"
                  className={`p-1.5 rounded-lg transition-colors ${
                    helpfulVote === "down"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 dark:hover:text-red-400"
                  }`}
                >
                  <ThumbsDown size={13} strokeWidth={2} />
                </button>
              </div>

              <div className="shrink-0 -mt-0.5 -mr-1">
                <ActionMenu />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <UserMeta
                name={author}
                createdAt={
                  mode === "full"
                    ? new Date(createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : createdAt
                }
                updatedAt={updatedAt}
                avatarUrl={profileURL}
              />
              {tags.length > 0 && (
                <>
                  <span className="hidden sm:inline text-gray-300 dark:text-gray-700 text-xs">
                    |
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <SubjectTag key={tag} label={tag} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <p
              className={`text-gray-600 dark:text-gray-400 leading-relaxed ${
                mode === "full"
                  ? "text-sm whitespace-pre-wrap"
                  : "text-xs line-clamp-3"
              }`}
            >
              {body}
            </p>

            <div className="flex justify-end pt-0.5">
              <button
                onClick={handleShare}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  shareCopied
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <Share2 size={12} strokeWidth={2} />
                {shareCopied ? "Link copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Answer — preview only, hidden on individual question page ── */}
      {mode === "preview" && (
        <div className="px-3.5 pb-3.5">
          <div className="flex gap-3 sm:gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="shrink-0 w-10 sm:w-14" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {featuredAnswer ? (
                <>
                  <span
                    className={`text-xs font-bold ${
                      isResolved
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-primary-700 dark:text-primary-400"
                    }`}
                  >
                    {isResolved ? "Resolved Answer" : "Top Answer"}
                  </span>
                  <Link href={`/questions/${id}`} className="block group">
                    <div className="pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                      <AnswerCard
                        {...featuredAnswer}
                        questionId={id}
                        comments={[]}
                        totalComments={0}
                        hideComments
                      />
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  href={`/questions/${id}`}
                  className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-5 flex items-center justify-center hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center">
                    There are no answers yet — be the first to help!
                  </p>
                </Link>
              )}

              {/* More answers — bottom right */}
              {answers.length > 1 && (
                <div className="flex justify-end pt-0.5">
                  <Link
                    href={`/questions/${id}`}
                    className="text-xs font-semibold text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                  >
                    {answers.length - 1} more{" "}
                    {answers.length - 1 === 1 ? "answer" : "answers"} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Composer ─────────────────────────────────────────────── */}
      {!isResolved && (
        <div className="px-3.5 pb-3.5">
          <div className="flex gap-3 sm:gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="shrink-0 w-10 sm:w-14" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Tab buttons — !w-fit overrides FullButton's w-full */}
              <div className="flex items-center justify-end gap-1.5">
                <FullButton
                  id={`create-tutorial-btn-${id}`}
                  label="Create Tutorial"
                  variant="secondary"
                  className="w-fit! py-1 px-2.5 text-xs"
                  onClick={() => onCreateTutorial?.(id)}
                />
                <FullButton
                  id={`answer-btn-${id}`}
                  label="Answer"
                  variant={composerTab === "answer" ? "primary" : "secondary"}
                  className="w-fit! py-1 px-2.5 text-xs"
                  onClick={() => handleComposerTab("answer")}
                />
                <FullButton
                  id={`comment-btn-${id}`}
                  label="Comment"
                  variant={composerTab === "comment" ? "primary" : "secondary"}
                  className="w-fit! py-1 px-2.5 text-xs"
                  onClick={() => handleComposerTab("comment")}
                />
              </div>

              {/*
                Both composers always mounted, toggled via display — keeps
                refs attached so programmatic focus() always works.
              */}
              <div style={{ display: composerTab === "answer" ? "block" : "none" }}>
                <CreateAnswer
                  questionId={id}
                  onSuccess={onAnswerPosted}
                  textareaRef={answerTextareaRef}
                />
              </div>
              <div style={{ display: composerTab === "comment" ? "block" : "none" }}>
                <CreateComment
                  questionId={id}
                  placeholder="Write a comment on this question…"
                  onSuccess={onCommentPosted}
                  textareaRef={commentTextareaRef}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}