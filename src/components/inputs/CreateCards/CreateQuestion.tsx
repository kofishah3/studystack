"use client";

import { useState } from "react";
import TextInput from "../TextInput";
import FullButton from "../FullButton";
import FileUploadArea, { type UploadFile } from "../../ui/FileUploadArea";

export default function AskQuestionCard() {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [category, setCategory] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  function authHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function uploadFile(questionId: string, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/questions/${questionId}/upload`, {
      method: "PUT",
      headers: authHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to upload ${file.name}`);
    }
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

      const questionId = data.questionId;

      if (questionId && uploads.length > 0) {
        const results = await Promise.allSettled(
          uploads.map((u) => uploadFile(questionId, u.file)),
        );
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          console.error("Some file uploads failed:", failed);
        }
      }

      setTitle("");
      setQuestionBody("");
      setCategory("");
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
          Share your question with the community
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

      <div className="pt-2">
        <FileUploadArea
          uploads={uploads}
          onChange={setUploads}
          allowDocuments={false}
        />
      </div>

      <div className="flex items-center justify-end">
        <div className="w-fit min-w-25">
          <FullButton
            label={isPosting ? (uploads.length > 0 ? "Uploading..." : "Posting...") : "Post Question"}
            className="py-2 px-6 text-sm"
            onClick={handlePost}
            disabled={isPosting || !title.trim()}
            isLoading={isPosting}
          />
        </div>
      </div>
    </div>
  );
}
