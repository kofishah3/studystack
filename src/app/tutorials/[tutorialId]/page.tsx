"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/topnavbar";
import UserMeta from "@/components/ui/UserMeta";
import FullButton from "@/components/inputs/FullButton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, MessageSquare, Play } from "lucide-react";
import QuestionCard from "@/components/cards/QuestionCard";
import { CommentCard, type CommentData, buildCommentTree } from "@/components/cards/CommentCard";
import CommentInput from "@/components/inputs/CommentInput";

export default function TutorialDetailPage() {
  const { tutorialId } = useParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const res = await fetch(`/api/tutorial/${tutorialId}`);
        const json = await res.json();
        if (json.data) {
          setTutorial(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch tutorial:", error);
      } finally {
        setLoading(false);
      }
    }
    if (tutorialId) fetchTutorial();
  }, [tutorialId]);

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
          tutorial_id: tutorialId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      const resTutorial = await fetch(`/api/tutorial/${tutorialId}`);
      const json = await resTutorial.json();
      if (json.data) {
        setTutorial(json.data);
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
          tutorial_id: tutorialId,
          parent_comment_id: parseInt(parentId),
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      
      const resTutorial = await fetch(`/api/tutorial/${tutorialId}`);
      const json = await resTutorial.json();
      if (json.data) {
        setTutorial(json.data);
      }
    } catch (error) {
      console.error("Reply submission failed:", error);
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
      
      const resTutorial = await fetch(`/api/tutorial/${tutorialId}`);
      const json = await resTutorial.json();
      if (json.data) {
        setTutorial(json.data);
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
              Loading tutorial...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
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
            Tutorial not found.
          </span>
          <Link
            href="/tutorials"
            className="px-6 py-2 bg-primary-700 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-700/20"
          >
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = Number(tutorial.avg_rating) || 0;
  const ratingColor =
    avgRating >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : avgRating >= 2.5
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-foreground"
      id="tutorial-detail-root"
    >
      <TopNavBar />

      <main
        className="flex-1 w-full max-w-4xl mx-auto px-4 py-6"
        id="tutorial-detail-main"
      >
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between px-1"
            id="tutorial-detail-top-bar"
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

          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col gap-6"
            id="tutorial-header-card"
          >
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                {tutorial.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-10 rounded-lg border text-center font-bold ${ratingColor}`}
                  >
                    <span className="text-lg leading-none">
                      {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-semibold">
                      Avg Rating
                    </span>
                    <span className="text-xs text-gray-500">
                      {tutorial.total_interactions} interactions
                    </span>
                  </div>
                </div>

                <UserMeta
                  name={tutorial.user_name}
                  createdAt={new Date(tutorial.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                  avatarUrl={tutorial.profile_url}
                  size="lg"
                />
              </div>
            </div>

            {tutorial.embedded_video_url && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black shadow-inner">
                <iframe
                  src={tutorial.embedded_video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title="Tutorial Video"
                />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {tutorial.content}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
              <FullButton
                label="Was this helpful?"
                className="w-full sm:w-fit px-8 py-2.5"
              />
            </div>
          </div>

          {tutorial.linked_questions &&
            tutorial.linked_questions.length > 0 && (
              <div
                className="mt-4 flex flex-col gap-4"
                id="linked-questions-section"
              >
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 px-2">
                  Based on Question:
                </h2>
                <div className="flex flex-col gap-4">
                  {tutorial.linked_questions.map((q: any) => (
                    <QuestionCard
                      key={q.question_id}
                      id={q.question_id}
                      questionTitle={q.title}
                      body={q.content}
                      author={q.user_name}
                      profileURL={q.profile_url}
                      createdAt={q.created_at}
                      category={q.category}
                      demandRate={q.demand_score}
                      mode="preview"
                    />
                  ))}
                </div>
              </div>
            )}

          <div
            className="mt-6 flex flex-col gap-6"
            id="tutorial-comments-section"
          >
            <div className="flex items-center gap-2 px-2">
              <MessageSquare size={16} className="text-gray-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Comments
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full text-xs font-bold">
                  {tutorial.comments?.length || 0}
                </span>
              </h2>
            </div>

            <div id="tutorial-comment-input-container" className="px-2">
              <CommentInput
                id="tutorial-comment-input"
                onSubmit={handlePostComment}
                placeholder="Add a comment to this tutorial..."
              />
            </div>

            <div className="flex flex-col gap-3" id="tutorial-comments-list">
              {buildCommentTree(tutorial.comments ?? []).map((comment) => (
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

              {(!tutorial.comments || tutorial.comments.length === 0) && (
                <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                  <MessageSquare size={24} className="text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No comments yet. Start the conversation!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
