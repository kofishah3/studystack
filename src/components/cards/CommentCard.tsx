"use client";

import { useState, useEffect } from "react";
import ActionMenu from "../ui/ActionMenu";
import UserMeta from "../ui/UserMeta";
import CommentInput from "../inputs/CommentInput";
import { Trash2 } from "lucide-react";

export interface CommentData {
  comment_id: number;
  user_id: string;
  author_name: string;
  created_at: string;
  content: string;
  author_profile_url?: string;
  parent_comment_id?: number | null;
  replies?: CommentData[];
}

export interface CommentCardProps {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  body: string;
  avatarUrl?: string;
  replies?: CommentData[];
  onReply?: (content: string, parentId: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  depth?: number;
}

export function buildCommentTree(comments: any[]): CommentData[] {
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
  id,
  authorId,
  authorName,
  createdAt,
  body,
  avatarUrl,
  replies = [],
  onReply,
  onDelete,
  depth = 0,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.user_id);
      } catch (e) {}
    }
  }, []);

  return (
    <div
      id={`comment-card-container-${id}`}
      className="flex flex-col gap-0 w-full"
    >
      <div
        id={`comment-card-${id}`}
        className="group flex gap-3 transition-colors bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50"
      >
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <UserMeta
              name={authorName}
              createdAt={new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              avatarUrl={avatarUrl}
              size="sm"
            />
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {currentUserId === authorId && onDelete && (
                <button
                  onClick={() => onDelete(id)}
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
            id={`comment-body-${id}`}
            className="leading-relaxed text-xs text-gray-500 dark:text-gray-400"
          >
            {body}
          </p>

          <div className="flex items-center gap-3">
            {onReply && (
              <button
                id={`comment-reply-btn-${id}`}
                onClick={() => setIsReplying((v) => !v)}
                className="text-[10px] font-bold text-gray-400 hover:text-primary-500 uppercase tracking-wider transition-colors"
              >
                {isReplying ? "Cancel" : "Reply"}
              </button>
            )}
            {replies.length > 0 && (
              <button
                id={`comment-toggle-replies-btn-${id}`}
                onClick={() => setShowReplies((v) => !v)}
                className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 transition-colors"
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
          id={`comment-reply-input-wrapper-${id}`}
          className="ml-8 mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <CommentInput
            id={`comment-reply-input-${id}`}
            placeholder={`Reply to ${authorName}...`}
            onSubmit={async (content) => {
              await onReply(content, id);
              setIsReplying(false);
            }}
          />
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div
          id={`comment-replies-${id}`}
          className="ml-6 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700 flex flex-col gap-2"
        >
          {replies.map((reply) => (
            <CommentCard
              key={reply.comment_id}
              id={reply.comment_id.toString()}
              authorId={reply.user_id}
              authorName={reply.author_name}
              createdAt={reply.created_at}
              body={reply.content}
              avatarUrl={reply.author_profile_url}
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
