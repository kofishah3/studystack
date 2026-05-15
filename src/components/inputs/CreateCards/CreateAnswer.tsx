"use client";

import React, { useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import FullButton from "../FullButton";

type UploadFile = {
  file: File;
  preview: string;
  type: "image" | "video";
};

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

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

  const imageCount = useMemo(
    () => uploads.filter((u) => u.type === "image").length,
    [uploads],
  );
  const videoCount = useMemo(
    () => uploads.filter((u) => u.type === "video").length,
    [uploads],
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    let curImages = imageCount;
    let curVideos = videoCount;
    const next: UploadFile[] = [];

    for (const file of selected) {
      if (file.type.startsWith("image/")) {
        if (curImages >= MAX_IMAGES) continue;
        curImages++;
        next.push({ file, preview: URL.createObjectURL(file), type: "image" });
      } else if (file.type.startsWith("video/")) {
        if (curVideos >= MAX_VIDEOS) continue;
        curVideos++;
        next.push({ file, preview: URL.createObjectURL(file), type: "video" });
      }
    }

    setUploads((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  function removeUpload(idx: number) {
    setUploads((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
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
      const token = localStorage.getItem("token"); // Get token

      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add this!
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to post answer");
      }

      const data = await res.json();
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
      {/* Textarea */}
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
          {/* File previews */}
          {uploads.length > 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {uploads.map((u, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0"
                >
                  <button
                    onClick={() => removeUpload(i)}
                    className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-black text-white rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                  {u.type === "image" ? (
                    <img
                      src={u.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={u.preview}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="px-3 pb-2 text-xs text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Bottom bar */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
            {/* Upload label */}
            <label className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors">
              <ImagePlus size={15} />
              <span>
                {imageCount}/{MAX_IMAGES} img · {videoCount}/{MAX_VIDEOS} vid
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleUpload}
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1"
              >
                Cancel
              </button>
              <FullButton
                id="create-answer-post"
                label="Post Answer"
                className="w-fit! py-1.5 px-4 text-xs"
                isLoading={isLoading}
                disabled={!content.trim()}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
