"use client";

import Link from "next/link";
import { useRef, useState, useMemo, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
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


export interface QuestionProps {
  question_id: QuestionID;
  user_id: UserID;
  title: string;
  content: string;
  category: string | null; // Updated to handle DB nulls
  demand_score: number;
  created_at: string;
  resolved_at?: string | null;
  user_name: string;
  profile_url?: string | null;
  answers?: AnswerProps[];
  mode?: "preview" | "full";
  onCreateTutorial?: (id: string) => void;
  onAnswerPosted?: (answer: Record<string, unknown>) => void;
  onCommentPosted?: (comment: Record<string, unknown>) => void;
}

type ComposerTab = "answer" | "comment";

export default function QuestionCard({
  question_id,
  title,
  content,
  category,
  demand_score,
  created_at,
  resolved_at,
  user_name,
  profile_url,
  answers = [],
  mode = "preview",
  onAnswerPosted,
  onCommentPosted,
  onCreateTutorial,
}: QuestionProps) {
  const [composerTab, setComposerTab] = useState<ComposerTab>("answer");
  const [helpfulVote, setHelpfulVote] = useState<"up" | "down" | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fix: Ensure client-side mounting to prevent Date hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolved = resolved_at != null;
  const idStr = String(question_id);
  

  // ── Optimized Derived Data ──────────────────────────────────────────────────
  const { demandColor, tags, formattedDate, featuredAnswer } = useMemo(() => {
    // 1. Demand Color Logic
    const color =
      demand_score >= 70
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
        : demand_score >= 40
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

    // 2. Fix: Defensive Category Splitting
    const categoryTags = (category ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 3. Formatting Date
    const date = new Date(created_at).toLocaleDateString("en-US", {
      month: mode === "full" ? "long" : "short",
      day: "numeric",
      year: "numeric",
    });

    // 4. Improved Sorting logic (Accepted first, then by date/order)
    const sortedAnswers = [...answers].sort((a, b) => {
        if (a.is_accepted && !b.is_accepted) return -1;
        if (!a.is_accepted && b.is_accepted) return 1;
        return 0;
    });
    
    const top = sortedAnswers.length > 0 ? sortedAnswers[0] : null;

    return { 
        demandColor: color, 
        tags: categoryTags, 
        formattedDate: date,
        featuredAnswer: top 
    };
  }, [category, demand_score, created_at, mode, answers]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleShare() {
    const url = `${window.location.origin}/questions/${idStr}`;
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

  return (
    <div
      className={`
        w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
        ${mode === "preview" ? "hover:shadow-md transition-shadow" : ""}
      `}
      id={`question-card-${idStr}`}
    >
      {/* Header Section */}
      <div className="p-3.5 px-5 flex gap-4">
        <div className={`shrink-0 flex flex-col items-center justify-center w-10 sm:w-14 rounded-lg border text-center font-bold self-start mt-0.5 py-1.5 ${demandColor}`}>
          <span className="text-[10px] sm:text-xs text-current opacity-60 leading-none mb-0.5">DMD</span>
          <span className="text-sm sm:text-lg leading-none">{demand_score}</span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
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

            <div className="shrink-0 flex items-center gap-1 mt-0.5">
              <span className="hidden sm:inline text-xs text-gray-400 font-medium">Helpful?</span>
              <button onClick={() => handleHelpful("up")} className={`p-1.5 rounded-lg ${helpfulVote === "up" ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:bg-gray-100"}`}>
                <ThumbsUp size={13} />
              </button>
              <button onClick={() => handleHelpful("down")} className={`p-1.5 rounded-lg ${helpfulVote === "down" ? "bg-red-100 text-red-500" : "text-gray-400 hover:bg-gray-100"}`}>
                <ThumbsDown size={13} />
              </button>
              <ActionMenu />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <UserMeta
              name={user_name}
              createdAt={mounted ? formattedDate : ""}
              avatarUrl={profile_url ?? undefined}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-l border-gray-200 dark:border-gray-700 ml-1 pl-2">
                {tags.map((tag) => <SubjectTag key={tag} label={tag} />)}
              </div>
            )}
          </div>

          <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${mode === "full" ? "text-sm whitespace-pre-wrap" : "text-xs line-clamp-3"}`}>
            {content}
          </p>

          <div className="flex justify-end pt-0.5">
            <button onClick={handleShare} className={`flex items-center gap-1 text-xs font-medium ${shareCopied ? "text-primary-600" : "text-gray-400 hover:text-primary-600"}`}>
              <Share2 size={12} />
              {shareCopied ? "Link copied!" : "Share"}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Answer Section */}
      {mode === "preview" && (
        <div className="px-3.5 pb-3.5">
          <div className="flex gap-3 sm:gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="shrink-0 w-10 sm:w-14" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {featuredAnswer ? (
                <>
                  <span className={`text-xs font-bold ${isResolved ? "text-emerald-600" : "text-primary-700"}`}>
                    {isResolved ? "Resolved Answer" : "Top Answer"}
                  </span>
                  {/* Change Link to div */}
                  <div 
                    onClick={() => router.push(`/questions/${idStr}`)}
                    className="block group opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                      <AnswerCard {...featuredAnswer} hideComments />
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                  <p className="text-xs text-gray-400 italic">No answers yet — be the first to help!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Composer Section */}
      {!isResolved && (
        <div className="px-3.5 pb-3.5">
          <div className="flex gap-3 sm:gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="shrink-0 w-10 sm:w-14" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center justify-end gap-1.5">
                <FullButton label="Create Tutorial" variant="secondary" className="w-fit! py-1 px-2.5 text-xs" onClick={() => onCreateTutorial?.(idStr)} />
                <FullButton label="Answer" variant={composerTab === "answer" ? "primary" : "secondary"} className="w-fit! py-1 px-2.5 text-xs" onClick={() => handleComposerTab("answer")} />
                <FullButton label="Comment" variant={composerTab === "comment" ? "primary" : "secondary"} className="w-fit! py-1 px-2.5 text-xs" onClick={() => handleComposerTab("comment")} />
              </div>

              <div style={{ display: composerTab === "answer" ? "block" : "none" }}>
                <CreateAnswer questionId={idStr} onSuccess={onAnswerPosted} textareaRef={answerTextareaRef} />
              </div>
              <div style={{ display: composerTab === "comment" ? "block" : "none" }}>
                <CreateComment questionId={idStr} onSuccess={onCommentPosted} textareaRef={commentTextareaRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}