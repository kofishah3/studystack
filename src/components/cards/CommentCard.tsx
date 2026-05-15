"use client";

import { useState, useEffect } from "react";
import ActionMenu from "../ui/ActionMenu";
import UserMeta from "../ui/UserMeta";
import CommentInput from "../inputs/CommentInput";
import { Trash, Trash2 } from "lucide-react";
import { usePrompt } from "@/contexts/PromptContext";
import type { CommentID, UserID } from "@/types/database";

// Mirrors the Comments table + author join columns returned by the API.
export interface CommentData {
  comment_id: CommentID;
  user_id: UserID;
  content: string;
  parent_comment_id: CommentID | null;
  question_id?: string | null;
  answer_id?: number | null;
  created_at: string; // ISO string from JSON — Date on the DB side
  // Join fields
  author_name: string;
  author_profile_url?: string | null;
  // Tree
  replies?: CommentData[];
}

// CommentCardProps is a direct projection of CommentData plus UI callbacks.
export interface CommentCardProps extends Omit<
  CommentData,
  "question_id" | "answer_id"
> {
  onReply?: (content: string, parentCommentId: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  depth?: number;
}

export function buildCommentTree(comments: CommentData[]): CommentData[] {
  const map = new Map<number, CommentData>();
  const roots: CommentData[] = [];

  comments.forEach((c) => {
    map.set(c.comment_id, { ...c, replies: [] });
  });

  map.forEach((node) => {
    if (node.parent_comment_id != null) {
      const parent = map.get(node.parent_comment_id);
      if (parent) {
        parent.replies!.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CommentCard({
  comment_id,
  user_id,
  author_name,
  author_profile_url,
  created_at,
  content,
  replies = [],
  onReply,
  onDelete,
  depth = 0,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { showPrompt } = usePrompt();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.user_id);
      } catch (e) {}
    }
  }, []);

  const idStr = comment_id.toString();

  const handleDeleteClick = () => {
    showPrompt({
      title: "Delete Comment?",
      description:
        "Are you sure you want to delete this comment? This cannot be undone.",
      icon: Trash,
      type: "confirmation",
      onAccept: async () => {
        onDelete?.(idStr);
      },
    });
  };

  return (
    <div
      id={`comment-card-container-${idStr}`}
      className="flex flex-col gap-0 w-full"
    >
      <div
        id={`comment-card-${idStr}`}
        className="group flex gap-3 transition-colors bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50"
      >
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <UserMeta
              name={author_name}
              createdAt={new Date(created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              avatarUrl={author_profile_url ?? undefined}
              size="sm"
            />
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {currentUserId === user_id && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 text-gray-400 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <ActionMenu />
            </div>
          </div>

          <p
            id={`comment-body-${idStr}`}
            className="leading-relaxed text-xs text-gray-500 dark:text-gray-400"
          >
            {content}
          </p>

          <div className="flex items-center gap-3">
            {onReply && (
              <button
                id={`comment-reply-btn-${idStr}`}
                onClick={() => setIsReplying((v) => !v)}
                className="text-[10px] font-bold text-gray-400 hover:text-primary-500 uppercase tracking-wider transition-colors"
              >
                {isReplying ? "Cancel" : "Reply"}
              </button>
            )}
            {replies.length > 0 && (
              <button
                id={`comment-toggle-replies-btn-${idStr}`}
                onClick={() => setShowReplies((v) => !v)}
                className="text-[10px] font-semibold text-primary-500 hover:text-primary-500 transition-colors"
              >
                {showReplies
                  ? `▲ Hide replies`
                  : `▼ ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && onReply && (
        <div
          id={`comment-reply-input-wrapper-${idStr}`}
          className="ml-8 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <CommentInput
            id={`comment-reply-input-${idStr}`}
            placeholder={`Reply to ${author_name}...`}
            onSubmit={async (content) => {
              await onReply(content, idStr);
              setIsReplying(false);
            }}
          />
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div
          id={`comment-replies-${idStr}`}
          className="ml-6 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 flex flex-col gap-2"
        >
          {replies.map((reply) => (
            <CommentCard
              key={reply.comment_id}
              {...reply}
              replies={reply.replies ?? []}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
