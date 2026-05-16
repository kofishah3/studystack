"use client";

import Link from "next/link";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Share2, Trash2, ArrowRight } from "lucide-react";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/Tag";
import HelpfulVoteButtons from "../ui/HelpfulVoteButtons";
import type { AnswerProps } from "./AnswerCard";
import AnswerCard from "./AnswerCard";
import FullButton from "../inputs/FullButton";
import CreateAnswer from "../inputs/CreateCards/CreateAnswer";
import CreateComment from "../inputs/CreateCards/CreateComment";
import CreateTutorial from "../inputs/CreateCards/CreateTutorial";
import type { QuestionID, UserID } from "@/types/database";
import { useRouter } from "next/navigation";
import { usePrompt } from "@/contexts/PromptContext";
import { useEligibility } from "@/hooks/useEligibility";

export interface QuestionProps {
  question_id: QuestionID;
  user_id: UserID;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  resolved_at?: string | null;
  user_name: string;
  profile_url?: string | null;
  institution?: string;
  degree_program?: string;
  answers?: AnswerProps[];
  mode?: "preview" | "full";
  onCreateTutorial?: (id: string) => void;
  onAnswerPosted?: (answer: Record<string, unknown>) => void;
  onCommentPosted?: (comment: Record<string, unknown>) => void;
  upvotes?: number;
  downvotes?: number;
  user_vote?: "up" | "down" | null;
  materials?: any[];
  onDelete?: (id: string) => void;
  currentUserId?: string | null;
}

type ComposerTab = "answer" | "comment";

export default function QuestionCard({
  question_id,
  user_id,
  title,
  content,
  category,
  created_at,
  resolved_at,
  user_name,
  profile_url,
  answers = [],
  mode = "preview",
  onAnswerPosted,
  onCommentPosted,
  onCreateTutorial,
  upvotes: initialUpvotes = 0,
  downvotes: initialDownvotes = 0,
  user_vote: initialUserVote = null,
  institution,
  degree_program,
  onDelete,
  currentUserId,
  materials = [],
}: QuestionProps) {
  const [composerTab, setComposerTab] = useState<ComposerTab>("answer");
  const [helpfulVote, setHelpfulVote] = useState<"up" | "down" | null>(
    initialUserVote,
  );
  const [upCount, setUpCount] = useState(initialUpvotes);
  const [downCount, setDownCount] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const { showPrompt } = usePrompt();
  const eligibility = useEligibility();

  const router = useRouter();
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolved = resolved_at != null;
  const idStr = String(question_id);

  const { tags, formattedDate, featuredAnswer } = useMemo(() => {
    const categoryTags = (category ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const date = new Date(created_at).toLocaleDateString("en-US", {
      month: mode === "full" ? "long" : "short",
      day: "numeric",
      year: "numeric",
    });

    const sortedAnswers = [...answers].sort((a, b) => {
      if (a.is_accepted && !b.is_accepted) return -1;
      if (!a.is_accepted && b.is_accepted) return 1;
      return 0;
    });

    const top = sortedAnswers.length > 0 ? sortedAnswers[0] : null;

    return {
      tags: categoryTags,
      formattedDate: date,
      featuredAnswer: top,
    };
  }, [category, created_at, mode, answers]);

  function handleShare() {
    const url = `${window.location.origin}/questions/${idStr}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  const handleHelpful = async (type: "up" | "down") => {
    if (loading) return;
    setLoading(true);

    const newValue: 1 | -1 | 0 =
      helpfulVote === type ? 0 : type === "up" ? 1 : -1;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interaction_type: "react",
          value: newValue,
          target_type: "question",
          target_id: question_id,
        }),
      });

      if (res.ok) {
        if (newValue === 0) {
          if (type === "up") setUpCount((prev) => prev - 1);
          else setDownCount((prev) => prev - 1);
          setHelpfulVote(null);
        } else if (newValue === 1) {
          setUpCount((prev) => prev + 1);
          if (helpfulVote === "down") setDownCount((prev) => prev - 1);
          setHelpfulVote("up");
        } else {
          setDownCount((prev) => prev + 1);
          if (helpfulVote === "up") setUpCount((prev) => prev - 1);
          setHelpfulVote("down");
        }
      }
    } catch (error) {
      console.error("Failed to save interaction:", error);
    } finally {
      setLoading(false);
    }
  };

  function handleComposerTab(tab: ComposerTab) {
    setComposerTab(tab);
    setTimeout(() => {
      if (tab === "answer") answerTextareaRef.current?.focus();
      else commentTextareaRef.current?.focus();
    }, 0);
  }

  const handleAnswerSuccess = useCallback(
    (answer: Record<string, unknown>) => {
      onAnswerPosted?.(answer);
      if (mode === "preview") {
        router.push(`/questions/${idStr}#question-answers`);
      }
    },
    [mode, onAnswerPosted, router, idStr],
  );

  const handleCommentSuccess = useCallback(
    (comment: Record<string, unknown>) => {
      onCommentPosted?.(comment);
      if (mode === "preview") {
        router.push(`/questions/${idStr}#question-comments`);
      }
    },
    [mode, onCommentPosted, router, idStr],
  );

  return (
    <div
      className={`
        w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
        ${
          mode === "preview"
            ? "hover:shadow-md hover:border-primary-300/70 dark:hover:border-primary-600/50 transition-all duration-200"
            : ""
        }
      `}
      id={`question-card-${idStr}`}
    >
      <div className="p-3.5 px-5 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <UserMeta
              name={user_name}
              createdAt={mounted ? formattedDate : ""}
              avatarUrl={profile_url ?? undefined}
              institution={institution}
              degreeProgram={degree_program}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-l border-gray-200 dark:border-gray-700 ml-1 pl-2">
                {tags.map((tag) => (
                  <SubjectTag key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <span className="hidden sm:inline text-xs text-gray-400 font-medium">
              Helpful?
            </span>
            <HelpfulVoteButtons
              upCount={upCount}
              downCount={downCount}
              userVote={helpfulVote}
              loading={loading}
              onVote={handleHelpful}
              variant="compact"
            />
            {currentUserId === user_id && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showPrompt({
                    title: "Delete Question?",
                    description:
                      "Are you sure you want to delete this question? This action cannot be undone.",
                    type: "confirmation",
                    icon: Trash2,
                    onAccept: () => onDelete?.(idStr),
                  });
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Delete question"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {mode === "full" ? (
            <>
              <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-base sm:text-lg">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-wrap mt-1">
                {content}
              </p>
            </>
          ) : (
            <Link
              href={`/questions/${idStr}`}
              className="group block rounded-lg -mx-1 px-1 py-0.5 -mt-0.5 hover:bg-primary-50/70 dark:hover:bg-primary-950/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs line-clamp-3 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {content}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-1.5 transition-all">
                View full question & discussion
                <ArrowRight
                  size={14}
                  className="shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
          )}
        </div>

        {materials.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 ${mode === "preview" ? "max-h-24 overflow-hidden" : ""}`}
          >
            {materials.map((m, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm"
              >
                {m.mime_type?.startsWith("image/") ? (
                  <img
                    src={m.url}
                    alt={m.file_name}
                    className={`${mode === "preview" ? "w-20 h-20" : "max-w-full max-h-[500px]"} object-contain`}
                  />
                ) : m.mime_type?.startsWith("video/") ? (
                  <video
                    src={m.url}
                    controls={mode === "full"}
                    className={`${mode === "preview" ? "w-20 h-20" : "max-w-full max-h-[500px]"} object-contain`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-0.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
            className={`flex items-center gap-1 text-xs font-medium ${shareCopied ? "text-primary-500" : "text-gray-400 hover:text-primary-500"}`}
          >
            <Share2 size={12} />
            {shareCopied ? "Link copied!" : "Share"}
          </button>
        </div>
      </div>

      {mode === "preview" && (
        <div className="px-3.5 pb-3.5">
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            {featuredAnswer ? (
              <>
                <span
                  className={`text-xs font-bold ${isResolved ? "text-emerald-600" : "text-primary-700"}`}
                >
                  {isResolved ? "Resolved Answer" : "Top Answer"}
                </span>
                <div
                  onClick={() => router.push(`/questions/${idStr}`)}
                  className="block group opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <AnswerCard {...featuredAnswer} hideComments />
                </div>
              </>
            ) : (
              <Link href={`/questions/${idStr}`}>
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors cursor-pointer">
                  <p className="text-xs text-gray-400 italic">
                    No answers yet — be the first to help!
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {!isResolved && (
        <div className="px-3.5 pb-3.5">
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-end gap-1.5">
              <FullButton
                label="Create Tutorial"
                variant="secondary"
                className="w-fit! py-1 px-2.5 text-xs"
                onClick={() => {
                  if (eligibility && !eligibility.canCreateTutorial) {
                    showPrompt({
                      title: "Unlock Tutorial Creation",
                      description: `You need a rating of ${eligibility.required.rating}+ and engagement of ${eligibility.required.engagement}+ to create tutorials. Your current scores: Rating ${eligibility.metrics.rating}, Engagement ${eligibility.metrics.engagement}. Keep answering questions and contributing to build your reputation!`,
                      type: "info",
                    });
                    return;
                  }
                  setShowTutorialModal(true);
                }}
              />
              <FullButton
                label="Answer"
                variant={composerTab === "answer" ? "primary" : "secondary"}
                className="w-fit! py-1 px-2.5 text-xs"
                onClick={() => handleComposerTab("answer")}
              />
              <FullButton
                label="Comment"
                variant={composerTab === "comment" ? "primary" : "secondary"}
                className="w-fit! py-1 px-2.5 text-xs"
                onClick={() => handleComposerTab("comment")}
              />
            </div>

            <div
              style={{ display: composerTab === "answer" ? "block" : "none" }}
            >
              <CreateAnswer
                questionId={idStr}
                onSuccess={handleAnswerSuccess}
                textareaRef={answerTextareaRef}
              />
            </div>
            <div
              style={{ display: composerTab === "comment" ? "block" : "none" }}
            >
              <CreateComment
                questionId={idStr}
                onSuccess={handleCommentSuccess}
                textareaRef={commentTextareaRef}
              />
            </div>
          </div>
        </div>
      )}

      {showTutorialModal && (
        <CreateTutorial
          questionId={idStr}
          questionTitle={title}
          onSuccess={() => setShowTutorialModal(false)}
          onClose={() => setShowTutorialModal(false)}
        />
      )}
    </div>
  );
}
