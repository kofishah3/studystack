"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/topnavbar";
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
import CommentInput from "@/components/inputs/CommentInput";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";

export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/questions/${questionId}`);
        const json = await res.json();
        if (json.data) {
          setQuestion(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch question:", error);
      } finally {
        setLoading(false);
      }
    }

    if (questionId) fetchQuestion();
  }, [questionId]);

  const handlePostComment = async (content: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content,
          question_id: questionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const resQuestion = await fetch(`/api/questions/${questionId}`);
      const json = await resQuestion.json();
      if (json.data) {
        setQuestion(json.data);
      }
    } catch (error) {
      console.error("Comment submission failed:", error);
      throw error;
    }
  };

  const handlePostReply = async (content: string, parentId: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content,
          question_id: questionId,
          parent_comment_id: parseInt(parentId),
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");

      const resQuestion = await fetch(`/api/questions/${questionId}`);
      const json = await resQuestion.json();
      if (json.data) {
        setQuestion(json.data);
      }
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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content,
          answer_id: parseInt(answerId),
          ...(parentId ? { parent_comment_id: parseInt(parentId) } : {}),
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment for answer");

      const resQuestion = await fetch(`/api/questions/${questionId}`);
      const json = await resQuestion.json();
      if (json.data) {
        setQuestion(json.data);
      }
    } catch (error) {
      console.error("Answer comment submission failed:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      const resQuestion = await fetch(`/api/questions/${questionId}`);
      const json = await resQuestion.json();
      if (json.data) {
        setQuestion(json.data);
      }
    } catch (error) {
      console.error("Comment deletion failed:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <TopNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-700/20 border-t-primary-700 rounded-full animate-spin"></div>
            <span className="text-gray-500 font-medium animate-pulse">
              Loading question...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <TopNavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <AlertCircle
              size={40}
              strokeWidth={1.5}
              className="text-gray-400"
            />
          </div>
          <span className="text-gray-500 text-xl font-semibold">
            Question not found.
          </span>
          <Link
            href="/questions"
            className="px-6 py-2 bg-primary-700 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-700/20"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  const demandRate = question.demand_score || 0;

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-foreground"
      id="question-detail-root"
    >
      <TopNavBar />

      <main
        className="flex-1 w-full max-w-4xl mx-auto px-4 py-6"
        id="question-detail-main"
      >
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between px-1"
            id="question-detail-top-bar"
          >
            <button
              id="back-button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 py-1 text-sm font-medium 
              text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 
              transition-colors group"
            >
              <ArrowLeft
                size={16}
                strokeWidth={2.5}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Back
            </button>
          </div>

          <QuestionCard
            id={question.question_id}
            questionTitle={question.title}
            body={question.content}
            author={question.user_name}
            profileURL={question.profile_url}
            createdAt={question.created_at}
            category={question.category}
            demandRate={demandRate}
            mode="full"
          />

          <div id="question-comment-input-container" className="px-1">
            <CommentInput
              id="question-comment-input"
              onSubmit={handlePostComment}
              placeholder="Add a comment to this question..."
            />
          </div>

          {question.comments && question.comments.length > 0 && (
            <div
              className="ml-7 sm:ml-12 flex flex-col gap-4 relative"
              id="question-comments-section"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

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
                {buildCommentTree(question.comments ?? []).map((comment) => (
                  <CommentCard
                    key={comment.comment_id}
                    id={comment.comment_id.toString()}
                    authorId={comment.user_id}
                    authorName={comment.author_name}
                    createdAt={comment.created_at}
                    body={comment.content}
                    avatarUrl={comment.author_profile_url}
                    replies={comment.replies}
                    onReply={handlePostReply}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4" id="answers-section">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Answers
                <span
                  className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 
                px-2 py-0.5 rounded-full text-xs font-bold"
                >
                  {question.answers?.length || 0}
                </span>
              </h2>
              <div
                className="flex items-center gap-2"
                id="answers-sort-container"
              >
                <span className="text-xs text-gray-400 font-semibold">
                  Sort by:
                </span>
                <select
                  id="answers-sort-select"
                  className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 border-none focus:ring-0 cursor-pointer p-0"
                >
                  <option>Top</option>
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {question.answers?.map((answer: any) => (
                <AnswerCard
                  key={answer.answer_id}
                  id={answer.answer_id.toString()}
                  credibilityScore={answer.author_credibility_score || 50}
                  authorName={answer.author_name}
                  body={answer.content}
                  createdAt={answer.created_at}
                  totalComments={answer.comments?.length || 0}
                  totalUpVotes={0}
                  totalDownVotes={0}
                  isResolved={answer.is_accepted}
                  userVote={null}
                  mediaURLs={answer.media_urls}
                  replies={answer.comments ?? []}
                  onReply={async (content, parentId) => {
                    await handlePostCommentForAnswer(
                      content,
                      answer.answer_id.toString(),
                      parentId ?? undefined,
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
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      No answers yet
                    </h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Be the first to share your knowledge and help others!
                    </p>
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
  );
}
