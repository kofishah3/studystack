"use client";

import { useRef, useState } from "react";
import FullButton from "../FullButton";

export interface CreateCommentProps {
  questionId: string;
  answerId?: number;
  placeholder?: string;
  onSuccess?: (comment: Record<string, unknown>) => void;
  /** Optional external ref — when provided the parent can focus this textarea */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function CreateComment({
  questionId,
  answerId,
  placeholder = "Write a comment…",
  onSuccess,
  textareaRef: externalRef,
}: CreateCommentProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  function handleCancel() {
    setExpanded(false);
    setContent("");
    setError(null);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const url = answerId
        ? `/api/questions/${questionId}/answers/${answerId}/comments`
        : `/api/questions/${questionId}/comments`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to post comment");
      }

      const data = await res.json();
      onSuccess?.(data.comment ?? data);
      setContent("");
      setExpanded(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200 ${
        expanded ? "shadow-sm" : ""
      }`}
    >
      {/* Textarea — no file upload for comments */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 4 : 1}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200"
        />
      </div>

      {expanded && (
        <>
          {error && (
            <p className="px-3 pb-2 text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1"
            >
              Cancel
            </button>
            <FullButton
              id="create-comment-post"
              label="Post Comment"
              className="w-fit! py-1.5 px-4 text-xs"
              isLoading={isLoading}
              disabled={!content.trim()}
              onClick={handleSubmit}
            />
          </div>
        </>
      )}
    </div>
  );
}