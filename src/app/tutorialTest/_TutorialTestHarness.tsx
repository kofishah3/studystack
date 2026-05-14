"use client";

/* TEMP TEST HARNESS — REMOVE ONCE TUTORIAL BACKEND FLOW IS VERIFIED */

import { useState } from "react";
import FullButton from "@/components/inputs/FullButton";
import TextInput from "@/components/inputs/TextInput";

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function TutorialTestHarness() {
  const [title, setTitle] = useState("Test tutorial");
  const [content, setContent] = useState("Test tutorial content body.");
  const [questionId, setQuestionId] = useState("");
  const [tutorialId, setTutorialId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState(false);

  function append(label: string, data: unknown) {
    setLog(
      (prev) =>
        `${prev}\n[${new Date().toLocaleTimeString()}] ${label}\n${JSON.stringify(
          data,
          null,
          2,
        )}\n`,
    );
  }

  async function createTutorial() {
    setBusy(true);
    try {
      const res = await fetch("/api/tutorial", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          title,
          content,
          question_ids: [questionId],
        }),
      });
      const body = await res.json().catch(() => ({}));
      append(`POST /api/tutorial → ${res.status}`, body);
      if (res.ok && body.tutorial?.tutorial_id)
        setTutorialId(body.tutorial.tutorial_id);
    } catch (err) {
      append("POST /api/tutorial → error", String(err));
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile() {
    if (!tutorialId || !file) {
      append("upload skipped", "need a tutorialId and a selected file");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/tutorial/${tutorialId}/upload`, {
        method: "PUT",
        headers: authHeaders(),
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      append(`PUT /api/tutorial/${tutorialId}/upload → ${res.status}`, body);
    } catch (err) {
      append("PUT upload → error", String(err));
    } finally {
      setBusy(false);
    }
  }

  async function fetchTutorial() {
    if (!tutorialId) {
      append("fetch skipped", "need a tutorialId");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/tutorial/${tutorialId}`, {
        headers: authHeaders(),
      });
      const body = await res.json().catch(() => ({}));
      append(`GET /api/tutorial/${tutorialId} → ${res.status}`, body);
    } catch (err) {
      append("GET tutorial → error", String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-4 border-dashed border-red-500 bg-red-50 p-6 my-10 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-red-700">
        ⚠️ TEMP TUTORIAL BACKEND TEST HARNESS — DELETE BEFORE MERGE ⚠️
      </h2>
      <p className="text-xs text-red-600">
        Exercises POST /api/tutorial → PUT upload → GET tutorial. Requires a
        logged-in token in localStorage and a valid question UUID.
      </p>

      <TextInput
        name="harness-title"
        placeholder="Tutorial title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextInput
        name="harness-content"
        placeholder="Tutorial content"
        multiline
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <TextInput
        name="harness-question-id"
        placeholder="Source question UUID"
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
      />
      <FullButton
        label="1. Create tutorial"
        onClick={createTutorial}
        isLoading={busy}
      />

      <TextInput
        name="harness-tutorial-id"
        placeholder="Tutorial UUID (auto-filled after create)"
        value={tutorialId}
        onChange={(e) => setTutorialId(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <FullButton
        label="2. Upload material/video"
        onClick={uploadFile}
        isLoading={busy}
      />
      <FullButton
        label="3. Fetch tutorial"
        onClick={fetchTutorial}
        isLoading={busy}
        variant="secondary"
      />

      <pre className="bg-white text-xs p-3 rounded border border-red-300 overflow-auto max-h-80 whitespace-pre-wrap">
        {log || "(no calls yet)"}
      </pre>
    </section>
  );
}
