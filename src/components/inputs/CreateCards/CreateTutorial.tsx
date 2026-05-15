"use client";

import { useState, useMemo } from "react";
import { X, BookOpen, Link, ImagePlus, Loader2 } from "lucide-react";
import FullButton from "../FullButton";
import TextInput from "../TextInput";
import {
  DOCUMENT_MIMES,
  VIDEO_MIMES,
  MAX_MATERIAL_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/validation/tutorial";
import FileUploadArea, { type UploadFile } from "../../ui/FileUploadArea";

export interface CreateTutorialProps {
  questionId: string;
  questionTitle?: string;
  onSuccess?: (tutorial: Record<string, unknown>) => void;
  onClose?: () => void;
}

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

function authJsonHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export default function CreateTutorial({
  questionId,
  questionTitle,
  onSuccess,
  onClose,
}: CreateTutorialProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  function handleCancel() {
    uploads.forEach((u) => u.preview && URL.revokeObjectURL(u.preview));
    setTitle("");
    setContent("");
    setVideoUrl("");
    setUploads([]);
    setError(null);
    onClose?.();
  }

  async function uploadFile(tutorialId: string, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/tutorial/${tutorialId}/upload`, {
      method: "PUT",
      headers: authHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Failed to upload ${file.name}`);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
        question_ids: [questionId],
      };

      if (videoUrl.trim()) {
        body.embedded_video_url = videoUrl.trim();
      }

      const res = await fetch("/api/tutorial", {
        method: "POST",
        headers: authJsonHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            data.reason ??
              data.error ??
              "You are not yet eligible to create tutorials.",
          );
        }
        throw new Error(data.error ?? "Failed to create tutorial.");
      }

      const tutorialId: string = data.tutorial?.tutorial_id;

      if (tutorialId && uploads.length > 0) {
        const results = await Promise.allSettled(
          uploads.map((u) => uploadFile(tutorialId, u.file)),
        );
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          const reasons = failed
            .map((r) => (r as PromiseRejectedResult).reason?.message)
            .filter(Boolean)
            .join("; ");
          setError(
            `Tutorial created, but ${failed.length} file(s) failed to upload: ${reasons}`,
          );
        }
      }

      onSuccess?.(data.tutorial);
      handleCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-0 overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">
              Create Tutorial
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          {questionTitle && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50">
              <Link size={13} className="text-primary-500 mt-0.5 shrink-0" />
              <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed line-clamp-2">
                Answering:{" "}
                <span className="font-semibold">{questionTitle}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <TextInput
              name="tutorial-title"
              placeholder="Give your tutorial a clear title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Content <span className="text-red-400">*</span>
            </label>
            <TextInput
              name="tutorial-content"
              placeholder="Write your tutorial here. Explain concepts clearly and step-by-step..."
              multiline
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Video Link{" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </label>
            <TextInput
              name="tutorial-video"
              placeholder="YouTube, Vimeo, or Loom URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Attachments{" "}
              <span className="text-gray-400 font-normal normal-case">
                (images, PDFs, videos — optional)
              </span>
            </label>

            <FileUploadArea
              uploads={uploads}
              onChange={setUploads}
              allowDocuments
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[10px] text-gray-400">
            Files upload after tutorial is created
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <FullButton
              label={
                isLoading
                  ? uploads.length > 0
                    ? "Uploading..."
                    : "Publishing..."
                  : "Publish Tutorial"
              }
              className="w-fit! py-2 px-5 text-sm"
              isLoading={isLoading}
              disabled={!title.trim() || !content.trim()}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
