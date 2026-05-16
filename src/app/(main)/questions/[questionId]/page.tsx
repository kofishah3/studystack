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
import { useSocket } from "@/contexts/SocketContext";

import { useQuestionActions } from "@/hooks/useQuestionActions";

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

  const { currentUserId, deleteQuestion } = useQuestionActions();

  const loadQuestion = useCallback(async () => {
    if (!questionId) return;
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        headers: authHeaders(),
      });
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

  useEffect(() => {
    if (loading || !data) return;
    const raw =
      typeof window !== "undefined" ? window.location.hash : "";
    if (raw !== "#question-answers" && raw !== "#question-comments") return;
    const id = raw.slice(1);
    requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [loading, data, questionId, answers.length, comments.length]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !questionId) return;

    socket.emit("join:question", questionId);

    const handleNewActivity = () => {
      // Small delay to ensure DB transaction finishes before fetching
      setTimeout(loadQuestion, 500);
    };

    socket.on("new:answer", handleNewActivity);
    socket.on("new:comment", handleNewActivity);

    return () => {
      socket.emit("leave:question", questionId);
      socket.off("new:answer", handleNewActivity);
      socket.off("new:comment", handleNewActivity);
    };
  }, [socket, questionId, loadQuestion]);

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

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          return showToast({
            type: "error",
            title: "Error",
            message: "You must be logged in to delete comments",
          });

        const res = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to delete comment");
        }

        showToast({
          type: "success",
          title: "Deleted",
          message: "Comment deleted successfully",
        });
        loadQuestion();
      } catch (error: any) {
        showToast({ type: "error", title: "Error", message: error.message });
      }
    },
    [loadQuestion, showToast],
  );

  const handleDeleteAnswer = useCallback(
    async (answerId: number) => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          return showToast({
            type: "error",
            title: "Error",
            message: "You must be logged in to delete answers",
          });

        const res = await fetch(`/api/answers/${answerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to delete answer");
        }

        showToast({
          type: "success",
          title: "Deleted",
          message: "Answer deleted successfully",
        });
        loadQuestion();
      } catch (error: any) {
        showToast({ type: "error", title: "Error", message: error.message });
      }
    },
    [loadQuestion, showToast],
  );

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      deleteQuestion(id, () => {
        router.push("/questions");
      });
    },
    [deleteQuestion, router],
  );

  const handleAcceptAnswer = useCallback(
    async (answerId: number) => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          return showToast({
            type: "error",
            title: "Error",
            message: "You must be logged in",
          });

        const res = await fetch(`/api/answers/${answerId}/accept`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Failed to accept answer");
        }

        showToast({
          type: "success",
          title: "Success",
          message: "Answer marked as resolved",
        });
        loadQuestion();
      } catch (error: any) {
        showToast({ type: "error", title: "Error", message: error.message });
      }
    },
    [loadQuestion, showToast],
  );

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
        <h2 className="text-xl font-bold">{error || "Question not found"}</h2>
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
          currentUserId={currentUserId}
          onDelete={handleDeleteQuestion}
          onAnswerPosted={handleAnswerPosted}
          onCommentPosted={handleQuestionCommentPosted}
        />

        <div id="question-comments" className="scroll-mt-24">
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
        </div>

        <div
          id="question-answers"
          className="mt-4 flex flex-col gap-4 scroll-mt-24"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            Answers
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 px-2.5 py-0.5 rounded-full text-xs">
              {answers.length}
            </span>
          </h2>

          <div className="flex flex-col gap-5">
            {(() => {
              const topAnswerId = answers.reduce(
                (max, a) => {
                  const score = (a.upvotes || 0) - (a.downvotes || 0);
                  if (score > 0 && score > max.score) {
                    return { id: a.answer_id, score };
                  }
                  return max;
                },
                { id: null as any, score: 0 },
              ).id;

              return answers.map((answer) => (
                <AnswerCard
                  key={answer.answer_id}
                  {...answer}
                  isTopAnswer={answer.answer_id === topAnswerId}
                  hideComments={false}
                  isQuestionAuthor={data?.user_id === currentUserId}
                  onAcceptAnswer={handleAcceptAnswer}
                  onReply={handleAnswerReply(Number(answer.answer_id))}
                  onDeleteComment={handleDeleteComment}
                  onDelete={handleDeleteAnswer}
                />
              ));
            })()}

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
