"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type QuestionPreview = {
  question_id: string;
  content: string;
  category: string;
  created_at: string;
};

function CreateTutorialForm() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("question");

  const [preview, setPreview] = useState<QuestionPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!questionId) return;
    const ctrl = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetch(
      `/api/tutorial/question-preview?questionId=${encodeURIComponent(questionId)}`,
      { signal: ctrl.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Preview failed (${res.status})`);
        }
        return res.json();
      })
      .then((data: QuestionPreview) => setPreview(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [questionId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Tutorial</h1>

      {questionId ? (
        <section className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Responding to question
          </h2>
          {loading && <p className="text-sm">Loading preview…</p>}
          {error && (
            <p className="text-sm text-red-500">Could not load: {error}</p>
          )}
          {preview && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {preview.category}
              </p>
              <p className="text-base">{preview.content}</p>
            </div>
          )}
        </section>
      ) : (
        <p className="text-sm text-red-500 mb-6">
          A source question is required. Open this page from a question to
          start a tutorial in response to it.
        </p>
      )}

      {questionId && (
        <p className="text-sm text-muted-foreground">
          Tutorial editor form goes here. On submit, POST /api/tutorial with
          the title, content, optional embedded_video_url, and{" "}
          <code>question_ids: [&quot;{questionId}&quot;]</code>.
        </p>
      )}
    </div>
  );
}

export default function CreateTutorialPage() {
  return (
    <Suspense>
      <CreateTutorialForm />
    </Suspense>
  );
}
