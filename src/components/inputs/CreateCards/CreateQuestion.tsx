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

      <TextInput
        name="question"
        placeholder="What would you like to ask?"
        multiline
        rows={6}
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
        {/* UPLOAD BUTTON */}
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

        <div className="w-fit min-w-[100px]">
          <FullButton
            label="Post"
            className="py-2 px-6 text-sm"
            onClick={() => console.log("Post Question")}
          />
        </div>
      </div>
    </div>
  );
}
