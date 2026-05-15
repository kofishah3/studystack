"use client";

import { useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import TextInput from "../TextInput";
import FullButton from "../FullButton";

type UploadFile = {
  file: File;
  preview: string;
  type: "image" | "video";
};

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

export default function AskQuestionCard() {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [category, setCategory] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const imageCount = useMemo(
    () => uploads.filter((u) => u.type === "image").length,
    [uploads],
  );

  const videoCount = useMemo(
    () => uploads.filter((u) => u.type === "video").length,
    [uploads],
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    const newUploads: UploadFile[] = [];

    let currentImages = imageCount;
    let currentVideos = videoCount;

    for (const file of selectedFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (isImage) {
        if (currentImages >= MAX_IMAGES) continue;

        currentImages++;

        newUploads.push({
          file,
          preview: URL.createObjectURL(file),
          type: "image",
        });
      } else if (isVideo) {
        if (currentVideos >= MAX_VIDEOS) continue;

        currentVideos++;

        newUploads.push({
          file,
          preview: URL.createObjectURL(file),
          type: "video",
        });
      }
    }

    setUploads((prev) => [...prev, ...newUploads]);
  }

  function removeUpload(index: number) {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePost() {
    if (!title.trim()) {
      setError("Please enter a question title");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: questionBody.trim() || "",
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post question");
      }

      setTitle("");
      setQuestionBody("");
      setCategory("general");
      setUploads([]);

      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to post question");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div
      className="
        w-full
        bg-surface border border-border
        rounded-2xl p-4
        flex flex-col gap-4
      "
    >
      <div>
        <h2 className="text-lg font-semibold text-text">Ask a Question</h2>

        <p className="text-xs text-muted mt-1">
          Upload up to 5 images and 3 videos
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <TextInput
        name="title"
        placeholder="Question title (e.g. How do I sort a list in Python?)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextInput
        name="question"
        placeholder="Elaborate your question..."
        multiline
        rows={6}
        value={questionBody}
        onChange={(e) => setQuestionBody(e.target.value)}
      />

      <TextInput
        name="category"
        placeholder="Tags (e.g. React, Javascript, Python)..."
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="
                relative w-24 h-24 rounded-xl overflow-hidden
                border border-border bg-background
              "
            >
              <button
                onClick={() => removeUpload(index)}
                className="
                  absolute top-1 right-1 z-10
                  bg-black/70 hover:bg-black
                  text-white rounded-full p-1
                  transition-colors
                "
              >
                <X size={12} />
              </button>

              {upload.type === "image" ? (
                <img
                  src={upload.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={upload.preview}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label
          className="
            flex items-center gap-2
            text-sm text-muted
            hover:text-primary-500
            cursor-pointer transition-colors
          "
        >
          <ImagePlus size={18} />

          <span>Upload File</span>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>

        <div className="w-fit min-w-25">
          <FullButton
            label={isPosting ? "Posting..." : "Post"}
            className="py-2 px-6 text-sm"
            onClick={handlePost}
            disabled={isPosting}
          />
        </div>
      </div>
    </div>
  );
}
