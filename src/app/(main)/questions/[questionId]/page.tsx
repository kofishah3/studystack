"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";

import QuestionCard from "@/components/cards/QuestionCard";
import AnswerCard, { type AnswerProps } from "@/components/cards/AnswerCard";
import {
  CommentCard,
  type CommentData,
  buildCommentTree,
} from "@/components/cards/CommentCard";
import FullButton from "@/components/inputs/FullButton";
import { useToast } from "@/contexts/ToastContext";

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [data, setData] = useState<any | null>(null);
  const [answers, setAnswers] = useState<AnswerProps[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    if (!questionId) return;
    try {
      const res = await fetch(`/api/questions/${questionId}`);
      if (!res.ok) throw new Error("Failed to load question");
      const json = await res.json();
      const d = json.data;

      setData(d);
      setAnswers(d.answers ?? []);
      setComments(d.comments ?? []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleAnswerPosted = useCallback(
    (raw: any) => {
      const newAnswer = raw.answer || raw;
      setAnswers((prev) => [newAnswer, ...prev]);
      showToast({
        type: "success",
        title: "Success",
        message: "Answer posted!",
      });
    },
    [showToast],
  );

  const handleQuestionCommentPosted = useCallback((raw: any) => {
    const newComment = raw.comment || raw;
    setComments((prev) => [...prev, newComment]);
  }, []);

  const handleAnswerReply =
    (answerId: number) => async (content: string, parentCommentId?: string) => {
      const res = await fetch(
        `/api/questions/${questionId}/answers/${answerId}/comments`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            content,
            parent_comment_id: parentCommentId ?? null,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to post reply");
      const d = await res.json();

      setAnswers((prev) =>
        prev.map((a) =>
          Number(a.answer_id) === answerId
            ? { ...a, comments: [...(a.comments ?? []), d.comment] }
            : a,
        ),
      );
    };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/questions/${questionId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      if (!res.ok) throw new Error("Failed to delete");

      setComments((prev) =>
        prev.filter((c) => String(c.comment_id) !== commentId),
      );
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          comments: (a.comments ?? []).filter(
            (c) => String(c.comment_id) !== commentId,
          ),
        })),
      );

      showToast({
        type: "success",
        title: "Deleted",
        message: "Comment removed.",
      });
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">
          {error || "Question not found"}
        </h2>
        <Link href="/questions" className="text-primary-700 hover:underline">
          Back to List
        </Link>
      </div>
    );

  return (
    <main className="flex-1 py-6 px-4 sm:px-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-700 transition-colors group"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </button>
            </div>

            <QuestionCard
              {...data}
              answers={answers}
              mode="full"
              onAnswerPosted={handleAnswerPosted}
              onCommentPosted={handleQuestionCommentPosted}
            />

            {comments.length > 0 && (
              <div className="ml-7 sm:ml-12 flex flex-col gap-4 relative">
                <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2 px-1">
                  <MessageSquare size={14} className="text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Comments
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {buildCommentTree(comments).map((comment) => (
                    <CommentCard
                      key={comment.comment_id}
                      {...comment}
                      onReply={async (content, parentId) => {
                        // Handle question-level replies
                        const res = await fetch(
                          `/api/questions/${questionId}/comments`,
                          {
                            method: "POST",
                            headers: authHeaders(),
                            body: JSON.stringify({
                              content,
                              parent_comment_id: parentId,
                            }),
                          },
                        );
                        if (res.ok) {
                          const d = await res.json();
                          setComments((prev) => [...prev, d.comment]);
                        }
                      }}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                Answers
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 px-2.5 py-0.5 rounded-full text-xs">
                  {answers.length}
                </span>
              </h2>

              <div className="flex flex-col gap-5">
                {answers.map((answer) => (
                  <AnswerCard
                    key={answer.answer_id}
                    {...answer}
                    hideComments={false}
                    onReply={handleAnswerReply(Number(answer.answer_id))}
                    onDeleteComment={handleDeleteComment}
                  />
                ))}

                {answers.length === 0 && (
                  <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center flex flex-col items-center gap-2">
                    <MessageSquare size={32} className="text-gray-300" />
                    <p className="text-gray-400 italic text-sm">
                      No answers yet. Be the first to help!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
    </main>
  );
}
