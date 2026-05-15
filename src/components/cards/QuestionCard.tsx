"use client";

import Link from "next/link";
import { useRef, useState, useMemo, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Share2, Trash2 } from "lucide-react";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/Tag";
import type { AnswerProps } from "./AnswerCard";
import AnswerCard from "./AnswerCard";
import FullButton from "../inputs/FullButton";
import CreateAnswer from "../inputs/CreateCards/CreateAnswer";
import CreateComment from "../inputs/CreateCards/CreateComment";
import type { QuestionID, UserID } from "@/types/database";
import { useRouter } from "next/navigation";
import { usePrompt } from "@/contexts/PromptContext";

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
  upvotes = 0,
  downvotes = 0,
  user_vote = null,
  institution,
  degree_program,
  onDelete,
  currentUserId,
}: QuestionProps) {
  const [composerTab, setComposerTab] = useState<ComposerTab>("answer");
  const [helpfulVote, setHelpfulVote] = useState<"up" | "down" | null>(
    user_vote,
  );
  const [upCount, setUpCount] = useState(upvotes);
  const [downCount, setDownCount] = useState(downvotes);
  const [loading, setLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showPrompt } = usePrompt();

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

  return (
    <div
      className={`
        w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
        ${mode === "preview" ? "hover:shadow-md transition-shadow" : ""}
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleHelpful("up");
              }}
              disabled={loading}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${helpfulVote === "up" ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:bg-gray-100"} disabled:opacity-50`}
            >
              <ThumbsUp size={13} />
              {upCount > 0 && (
                <span className="text-[10px] font-bold">{upCount}</span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleHelpful("down");
              }}
              disabled={loading}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${helpfulVote === "down" ? "bg-red-100 text-red-500" : "text-gray-400 hover:bg-gray-100"} disabled:opacity-50`}
            >
              <ThumbsDown size={13} />
              {downCount > 0 && (
                <span className="text-[10px] font-bold">{downCount}</span>
              )}
            </button>
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
            <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-base sm:text-lg">
              {title}
            </h1>
          ) : (
            <Link href={`/questions/${idStr}`} className="group">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight text-sm group-hover:text-primary-700 transition-colors">
                {title}
              </h2>
            </Link>
          )}
        </div>

        <p
          className={`text-gray-600 dark:text-gray-400 leading-relaxed ${mode === "full" ? "text-sm whitespace-pre-wrap" : "text-xs line-clamp-3"}`}
        >
          {content}
        </p>

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
                onClick={() => onCreateTutorial?.(idStr)}
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
                onSuccess={onAnswerPosted}
                textareaRef={answerTextareaRef}
              />
            </div>
            <div
              style={{ display: composerTab === "comment" ? "block" : "none" }}
            >
              <CreateComment
                questionId={idStr}
                onSuccess={onCommentPosted}
                textareaRef={commentTextareaRef}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
