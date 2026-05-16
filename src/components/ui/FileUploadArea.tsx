"use client";

import { useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  DOCUMENT_MIMES,
  VIDEO_MIMES,
  MAX_MATERIAL_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/validation/tutorial";

export type UploadFile = {
  file: File;
  preview: string;
  type: "image" | "video" | "document";
};

interface FileUploadAreaProps {
  uploads: UploadFile[];
  onChange: (uploads: UploadFile[]) => void;
  /** Accept document types in addition to images/videos. Default: false */
  allowDocuments?: boolean;
  maxImages?: number;
  maxVideos?: number;
}

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_VIDEOS = 3;

function classifyFile(file: File, allowDocuments: boolean): UploadFile["type"] | null {
  if (file.type.startsWith("image/")) {
    if (allowDocuments && !(DOCUMENT_MIMES as readonly string[]).includes(file.type)) return null;
    return "image";
  }
  if ((VIDEO_MIMES as readonly string[]).includes(file.type)) return "video";
  if (allowDocuments && (DOCUMENT_MIMES as readonly string[]).includes(file.type)) return "document";
  return null;
}

export default function FileUploadArea({
  uploads,
  onChange,
  allowDocuments = false,
  maxImages = DEFAULT_MAX_IMAGES,
  maxVideos = DEFAULT_MAX_VIDEOS,
}: FileUploadAreaProps) {
  const imageCount = useMemo(
    () => uploads.filter((u) => u.type === "image").length,
    [uploads],
  );
  const videoCount = useMemo(
    () => uploads.filter((u) => u.type === "video").length,
    [uploads],
  );

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    let curImages = imageCount;
    let curVideos = videoCount;
    const next: UploadFile[] = [];

    for (const file of selected) {
      const type = classifyFile(file, allowDocuments);
      if (!type) continue;

      const sizeLimit =
        type === "video" ? MAX_VIDEO_BYTES : MAX_MATERIAL_BYTES;
      if (file.size > sizeLimit) continue;

      if (type === "image") {
        if (curImages >= maxImages) continue;
        curImages++;
        next.push({ file, preview: URL.createObjectURL(file), type });
      } else if (type === "video") {
        if (curVideos >= maxVideos) continue;
        curVideos++;
        next.push({ file, preview: URL.createObjectURL(file), type });
      } else {
        next.push({ file, preview: "", type });
      }
    }

    onChange([...uploads, ...next]);
    e.target.value = "";
  }

  function remove(idx: number) {
    const copy = [...uploads];
    if (copy[idx].preview) URL.revokeObjectURL(copy[idx].preview);
    copy.splice(idx, 1);
    onChange(copy);
  }

  const accept = allowDocuments
    ? "image/*,video/mp4,video/webm,video/ogg,.pdf,.docx,.pptx"
    : "image/*,video/*";

  return (
    <div className="flex flex-col gap-2">
      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploads.map((u, i) => (
            <div
              key={i}
              className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0"
            >
              {u.type === "image" ? (
                <img
                  src={u.preview}
                  alt=""
                  className="w-20 h-20 object-cover"
                />
              ) : u.type === "video" ? (
                <video
                  src={u.preview}
                  className="w-20 h-20 object-cover"
                  muted
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center px-1">
                  <span className="text-[10px] text-gray-500 text-center leading-tight break-all">
                    {u.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-1.5 w-fit text-xs text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors">
        <ImagePlus size={15} />
        <span>
          {imageCount}/{maxImages} img · {videoCount}/{maxVideos} vid
          {allowDocuments && " · docs"}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleSelect}
        />
      </label>
    </div>
  );
}
