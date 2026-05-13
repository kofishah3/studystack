"use client";

import { useState } from "react";
import ActionMenu from "../ui/ActionMenu";
import UserMeta from "../ui/UserMeta";
import CommentInput from "../inputs/CommentInput";

export interface CommentCardProps {
  id: string;
  authorName: string;
  createdAt: string;
  body: string;
  avatarUrl?: string;
  onReply?: (content: string, parentId: string) => Promise<void>;
}

export function CommentCard({
  id,
  authorName,
  createdAt,
  body,
  avatarUrl,
  onReply,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div 
      id={`comment-card-container-${id}`}
      className="group flex flex-col gap-2 w-full"
    >
      <div 
        id={`comment-card-${id}`}
        className="flex gap-3 transition-colors bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50"
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
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ActionMenu />
            </div>
          </div>

          <p id={`comment-body-${id}`} className="leading-relaxed text-xs text-gray-500 dark:text-gray-400">
            {body}
          </p>

          <div className="flex items-center gap-4">
            <button
              id={`comment-reply-btn-${id}`}
              onClick={() => setIsReplying(!isReplying)}
              className="text-[10px] font-bold text-gray-400 hover:text-primary-500 uppercase tracking-wider transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {isReplying && onReply && (
        <div 
          id={`comment-reply-input-wrapper-${id}`}
          className="ml-8 mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
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
    </div>
  );
}
