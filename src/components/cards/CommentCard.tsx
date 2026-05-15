"use client";

import { useState } from "react";
import ActionMenu from "../ui/ActionMenu";
import UserMeta from "../ui/UserMeta";
import FullButton from "../inputs/FullButton";
import TextInput from "../inputs/TextInput";
import TextButton from "../inputs/textbutton";

export interface CommentCardProps {
  comment_id?: number;
  authorName: string;
  createdAt: string;
  body: string;
  avatarUrl?: string;
  replies?: CommentCardProps[];
  onReplySubmit?: (content: string) => Promise<void>;
}

export function CommentCard({
  comment_id,
  authorName,
  createdAt,
  body,
  avatarUrl,
  replies = [],
  onReplySubmit,
}: CommentCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<CommentCardProps[]>(replies);
  const [showReplies, setShowReplies] = useState(false);

  const handlePost = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReplySubmit?.(replyText);
      setLocalReplies((prev) => [
        ...prev,
        {
          authorName: "You",
          createdAt: new Date().toISOString(),
          body: replyText,
        },
      ]);
      setReplyText("");
      setShowReply(false);
      setShowReplies(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="group flex gap-3 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 transition-colors">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Header */}
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

        {/* Body */}
        <p className="leading-relaxed text-xs text-gray-500 dark:text-gray-400">
          {body}
        </p>

        {/* Reply / show-replies row — TextButton for both actions */}
        <div className="flex items-center">
          <TextButton
            label="Reply"
            textColor="gray-400"
            hoverColor="primary-700"
            selectedColor="primary-700"
            isSelected={showReply}
            onClick={() => setShowReply((v) => !v)}
          />
          {localReplies.length > 0 && (
            <TextButton
              label={
                showReplies
                  ? "Hide replies"
                  : `${localReplies.length} ${localReplies.length === 1 ? "reply" : "replies"}`
              }
              textColor="gray-400"
              hoverColor="primary-700"
              selectedColor="primary-700"
              isSelected={showReplies}
              onClick={() => setShowReplies((v) => !v)}
            />
          )}
        </div>

        {/* Inline reply composer — TextInput (multiline) + FullButton */}
        {showReply && (
          <div className="flex flex-col gap-2 mt-1 pl-3 border-l-2 border-primary-100 dark:border-primary-900/30">
            <TextInput
              name={`reply-${comment_id}`}
              placeholder="Write a reply…"
              multiline
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end items-center gap-2">
              <TextButton
                label="Cancel"
                textColor="gray-400"
                hoverColor="gray-600"
                selectedColor="gray-600"
                onClick={() => {
                  setShowReply(false);
                  setReplyText("");
                }}
              />
              <FullButton
                id={`reply-post-${comment_id}`}
                label={submitting ? "Posting…" : "Post"}
                className="w-fit px-4 py-1 text-xs"
                onClick={handlePost}
                isLoading={submitting}
              />
            </div>
          </div>
        )}

        {/* Nested replies (recursive) */}
        {showReplies && localReplies.length > 0 && (
          <div className="flex flex-col gap-2 pl-3 border-l-2 border-gray-100 dark:border-gray-800 mt-1">
            {localReplies.map((r, i) => (
              <CommentCard
                key={r.comment_id ?? i}
                {...r}
                onReplySubmit={async (content) => {
                  await onReplySubmit?.(content);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}