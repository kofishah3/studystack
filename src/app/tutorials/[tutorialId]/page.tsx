"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/topnavbar";
import UserMeta from "@/components/ui/UserMeta";
import FullButton from "@/components/inputs/FullButton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function TutorialDetailPage() {
  const { tutorialId } = useParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const res = await fetch(`/api/tutorial/${tutorialId}`);
        const json = await res.json();
        if (json.data) {
          setTutorial(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch tutorial:", error);
      } finally {
        setLoading(false);
      }
    }
    if (tutorialId) fetchTutorial();
  }, [tutorialId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopNavBar />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500">Loading tutorial...</span>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopNavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-gray-500 text-lg">Tutorial not found.</span>
          <Link href="/tutorials" className="text-blue-600 hover:underline">
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = Number(tutorial.avg_rating) || 0;
  const ratingColor =
    avgRating >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : avgRating >= 2.5
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNavBar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {tutorial.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className={`flex flex-col items-center justify-center w-16 h-10 rounded-xl border text-center ${ratingColor}`}
                >
                  <span className="text-xl font-bold leading-none">
                    {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Avg Rating
                  </span>
                  <span className="text-xs text-gray-400">
                    {tutorial.total_interactions} interactions
                  </span>
                </div>
              </div>

              <UserMeta
                name={tutorial.user_name}
                createdAt={new Date(tutorial.created_at).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
                avatarUrl={tutorial.profile_url}
              />
            </div>
          </div>

          {tutorial.embedded_video_url && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black shadow-lg">
              <iframe
                src={tutorial.embedded_video_url}
                className="w-full h-full"
                allowFullScreen
                title="Tutorial Video"
              />
            </div>
          )}

          {tutorial.linked_questions?.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Linked Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {tutorial.linked_questions.map((q: any) => (
                  <Link
                    key={q.question_id}
                    href="/questions"
                    className="px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    {q.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
              <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {tutorial.content}
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-100 dark:border-gray-800">
            <FullButton label="Was this helpful?" />
          </div>
        </div>
      </main>
    </div>
  );
}
