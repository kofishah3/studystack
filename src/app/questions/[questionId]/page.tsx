"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavBar from "@/components/navigation/TopNavigationBar";
import FullButton from "@/components/inputs/FullButton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AnswerCard from "@/components/cards/AnswerCard";
import {
  CommentCard,
  type CommentData,
  buildCommentTree,
} from "@/components/cards/CommentCard";
import QuestionCard from "@/components/cards/QuestionCard";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function refetchQuestion() {
    const res = await fetch(`/api/questions/${questionId}`);
    const json = await res.json();
    if (json.data) setQuestion(json.data);
  }

  useEffect(() => {
    async function fetchQuestion() {
      try {
        await refetchQuestion();
      } catch (error) {
        console.error("Failed to fetch question:", error);
      } finally {
        setLoading(false);
      }
    }
    if (questionId) fetchQuestion();
  }, [questionId]);

  const handleAnswerPosted = async (_answer: Record<string, unknown>) => {
    try { await refetchQuestion(); }
    catch (error) { console.error("Failed to refresh after answer post:", error); }
  };

  const handleCommentPosted = async (_comment: Record<string, unknown>) => {
    try { await refetchQuestion(); }
    catch (error) { console.error("Failed to refresh after comment post:", error); }
  };

  const handlePostReply = async (content: string, parentId: string) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content, parent_comment_id: parseInt(parentId) }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      await refetchQuestion();
    } catch (error) {
      console.error("Reply submission failed:", error);
      throw error;
    }
  };

  const handlePostCommentForAnswer = async (
    content: string,
    answerId: string,
    parentId?: string,
  ) => {
    try {
      const res = await fetch(
        `/api/questions/${questionId}/answers/${answerId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content,
            ...(parentId ? { parent_comment_id: parseInt(parentId) } : {}),
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to post comment for answer");
      await refetchQuestion();
    } catch (error) {
      console.error("Answer comment submission failed:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast({ type: "error", title: "Not authenticated", message: "Please log in to delete comments." });
        return;
      }
      const res = await fetch(`/api/questions/${questionId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete comment");
      }
      await refetchQuestion();
      showToast({ type: "success", title: "Comment deleted", message: "Your comment has been removed successfully." });
    } catch (error: any) {
      console.error("Comment deletion failed:", error);
      showToast({ type: "error", title: "Delete failed", message: error.message || "Something went wrong. Please try again." });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <TopNavBar />
        <div className="flex flex-row flex-1 w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-700/20 border-t-primary-700 rounded-full animate-spin" />
              <span className="text-gray-500 font-medium animate-pulse">Loading question...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <TopNavBar />
        <div className="flex flex-row flex-1 w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <AlertCircle size={40} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <span className="text-gray-500 text-xl font-semibold">Question not found.</span>
            <Link href="/questions" className="px-6 py-2 bg-primary-700 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-700/20">
              Back to Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-background text-foreground overflow-hidden"
      id="question-detail-root"
    >
      <TopNavBar />
      <div className="flex flex-row flex-1 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 py-6 px-4 sm:px-8 overflow-y-auto" id="question-detail-main">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1" id="question-detail-top-bar">
              <button
                id="back-button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 py-1 text-sm font-medium
                  text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400
                  transition-colors group"
              >
                <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            </div>

            {/* QuestionCard — full mode, DB-aligned props passed directly */}
            <QuestionCard
              // ── Identity ────────────────────────────────────────────────────
              question_id={question.question_id}
              user_id={question.user_id}
              // ── Content ─────────────────────────────────────────────────────
              title={question.title}
              content={question.content}
              category={question.category ?? ""}
              demand_score={question.demand_score}
              // ── Timestamps ──────────────────────────────────────────────────
              created_at={question.created_at}
              resolved_at={question.resolved_at ?? null}
              // ── Author ──────────────────────────────────────────────────────
              user_name={question.user_name}
              profile_url={question.profile_url ?? null}
              // ── Answers — raw DB rows, no mapping needed ─────────────────────
              answers={question.answers ?? []}
              // ── Mode + callbacks ────────────────────────────────────────────
              mode="full"
              onAnswerPosted={handleAnswerPosted}
              onCommentPosted={handleCommentPosted}
            />

            {/* Question-level comments thread */}
            {question.comments && question.comments.length > 0 && (
              <div
                className="ml-7 sm:ml-12 flex flex-col gap-4 relative"
                id="question-comments-section"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />

                <div className="flex items-center gap-2 px-1">
                  <MessageSquare size={14} className="text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                    Comments
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded text-xs">
                      {question.comments.length}
                    </span>
                  </h3>
                </div>

                <div className="flex flex-col gap-2" id="question-comments-list">
                  {/* buildCommentTree expects CommentData[] and CommentCard
                      expects those same DB-aligned fields directly */}
                  {buildCommentTree(question.comments as CommentData[]).map((comment) => (
                    <CommentCard
                      key={comment.comment_id}
                      // ── All fields are already DB-aligned on CommentData ────
                      comment_id={comment.comment_id}
                      user_id={comment.user_id}
                      author_name={comment.author_name}
                      author_profile_url={comment.author_profile_url}
                      created_at={comment.created_at}
                      content={comment.content}
                      parent_comment_id={comment.parent_comment_id}
                      replies={comment.replies}
                      onReply={handlePostReply}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Answers section */}
            <div className="mt-4 flex flex-col gap-4" id="answers-section">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Answers
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full text-xs font-bold">
                    {question.answers?.length ?? 0}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col gap-5">
                {question.answers?.map((answer: any) => (
                  <AnswerCard
                    key={answer.answer_id}
                    // ── All fields DB-aligned — no remapping ─────────────────
                    answer_id={answer.answer_id}
                    user_id={answer.user_id}
                    question_id={question.question_id}
                    content={answer.content}
                    media_urls={answer.media_urls ?? []}
                    is_accepted={answer.is_accepted}
                    created_at={answer.created_at}
                    author_name={answer.author_name}
                    author_profile_url={answer.author_profile_url ?? null}
                    author_credibility_score={answer.author_credibility_score ?? 50}
                    // comments is CommentData[] from the API
                    comments={answer.comments ?? []}
                    userVote={null}
                    // Callbacks
                    onReply={async (content, parentId) => {
                      await handlePostCommentForAnswer(
                        content,
                        answer.answer_id.toString(),
                        parentId,
                      );
                    }}
                    onDeleteComment={handleDeleteComment}
                  />
                ))}

                {(!question.answers || question.answers.length === 0) && (
                  <div
                    className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3"
                    id="no-answers-placeholder"
                  >
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-700">
                      <MessageSquare size={20} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">No answers yet</h3>
                      <p className="text-xs text-gray-500 max-w-xs">Be the first to share your knowledge and help others!</p>
                    </div>
                    <FullButton
                      id="post-answer-button"
                      label="Post an Answer"
                      className="mt-1 w-fit px-6 py-2 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}