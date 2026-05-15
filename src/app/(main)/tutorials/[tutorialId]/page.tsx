"use client";
import { useEffect, useState } from "react";
import UserMeta from "@/components/ui/UserMeta";
import FullButton from "@/components/inputs/FullButton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import QuestionCard from "@/components/cards/QuestionCard";
import { CommentCard, buildCommentTree } from "@/components/cards/CommentCard";
import CommentInput from "@/components/inputs/CommentInput";
import TutorialInteraction from "@/components/tutorials/TutorialInteraction";

export default function TutorialDetailPage() {
  const { tutorialId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const resTutorial = await fetch(`/api/tutorial/${tutorialId}`, {
        headers,
      });
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
      const token = localStorage.getItem("token");
      if (!token) {
        showToast({
          type: "error",
          title: "Not authenticated",
          message: "Please log in to delete comments.",
        });
        return;
      }

      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete comment");
      }

      const resTutorial = await fetch(`/api/tutorial/${tutorialId}`);
      const json = await resTutorial.json();
      if (json.data) {
        setTutorial(json.data);
      }

      showToast({
        type: "success",
        title: "Comment deleted",
        message: "Your comment has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Comment deletion failed:", error);
      showToast({
        type: "error",
        title: "Delete failed",
        message: error.message || "Something went wrong. Please try again.",
      });
      throw error;
    }
  };

  const fetchTutorial = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch(`/api/tutorial/${tutorialId}`, { headers });
      const json = await res.json();
      if (json.data) {
        setTutorial(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch tutorial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tutorialId) fetchTutorial();
  }, [tutorialId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-700/20 border-t-primary-700 rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium animate-pulse">
            Loading tutorial...
          </span>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <AlertCircle size={40} strokeWidth={1.5} className="text-gray-400" />
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
    <main
      className="flex-1 py-6 px-4 sm:px-8 overflow-y-auto bg-gray-50 dark:bg-black"
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

          {tutorial.materials && tutorial.materials.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Attachments
              </h3>
              <div className="flex flex-col gap-3">
                {tutorial.materials.map((m: any) => {
                  if (!m.url) return null;
                  const isImage = m.mime_type?.startsWith("image/");
                  const isVideo = m.mime_type?.startsWith("video/");
                  return (
                    <div
                      key={m.material_id}
                      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    >
                      {isImage ? (
                        <img
                          src={m.url}
                          alt={m.file_name}
                          className="w-full max-h-[480px] object-contain"
                        />
                      ) : isVideo ? (
                        <video
                          src={m.url}
                          controls
                          className="w-full max-h-[480px]"
                        />
                      ) : (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 truncate">
                            {m.file_name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {(m.size_bytes / 1024).toFixed(0)} KB
                          </span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <TutorialInteraction
            tutorialId={tutorialId as string}
            initialAvgRating={avgRating}
            initialTotalInteractions={tutorial.total_interactions}
            initialUpvotes={tutorial.upvotes || 0}
            initialDownvotes={tutorial.downvotes || 0}
            initialUserRating={
              tutorial.userInteractions?.find(
                (i: any) => i.interaction_type === "rating",
              )?.value || 0
            }
            initialUserVote={
              (() => {
                const v = tutorial.userInteractions?.find(
                  (i: any) => i.interaction_type === "react",
                )?.value;
                return v === 1 ? "up" : v === -1 ? "down" : null;
              })()
            }
            onUpdate={fetchTutorial}
          />
        </div>

        {tutorial.linked_questions && tutorial.linked_questions.length > 0 && (
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
                  question_id={q.question_id}
                  user_id={q.user_id}
                  title={q.title}
                  content={q.content}
                  user_name={q.user_name}
                  profile_url={q.profile_url}
                  created_at={q.created_at}
                  category={q.category}
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
                {...comment}
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
  );
}
