"use client";

import React, { useRef, useState } from "react";
import FullButton from "../FullButton";
import FileUploadArea, { type UploadFile } from "../../ui/FileUploadArea";

export interface CreateAnswerProps {
  questionId: string;
  onSuccess?: (answer: Record<string, unknown>) => void;
  /** Optional external ref — parent can focus this textarea */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function CreateAnswer({
  questionId,
  onSuccess,
  textareaRef: externalRef,
}: CreateAnswerProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  function authHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function uploadFile(answerId: number, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/questions/${questionId}/answers/${answerId}/upload`, {
      method: "PUT",
      headers: authHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to upload ${file.name}`);
    }
  }

  function handleCancel() {
    setExpanded(false);
    setContent("");
    setUploads([]);
    setError(null);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to post answer");
      }

      const answerId = data.answer?.answer_id;
      if (answerId && uploads.length > 0) {
        // Sequential uploads to avoid overwhelming or for simplicity
        for (const u of uploads) {
          await uploadFile(answerId, u.file);
        }
      }

      onSuccess?.(data.answer);
      setContent("");
      setUploads([]);
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
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 5 : 1}
          placeholder="Leave an answer…"
          className="w-full resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200"
        />
      </div>

      {expanded && (
        <>
          <div className="px-3 pb-3">
            <FileUploadArea
              uploads={uploads}
              onChange={setUploads}
              allowDocuments={false}
            />
          </div>

          {error && (
            <p className="px-3 pb-2 text-xs text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1"
              >
                Cancel
              </button>
              <FullButton
                id="create-answer-post"
                label={isLoading ? (uploads.length > 0 ? "Uploading..." : "Posting...") : "Post Answer"}
                className="w-fit! py-1.5 px-4 text-xs"
                isLoading={isLoading}
                disabled={!content.trim() || isLoading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
