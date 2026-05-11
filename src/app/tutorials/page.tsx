"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/topnavbar";
import TutorialCard from "@/components/cards/TutorialCard";

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function fetchTutorials(pageNum: number, append = false) {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/tutorial?page=${pageNum}&limit=20`);
      const json = await res.json();

      if (json.data) {
        setTutorials((prev) => (append ? [...prev, ...json.data] : json.data));
        setHasMore(json.hasMore ?? false);
      }
    } catch (error) {
      console.error("Failed to fetch tutorials:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchTutorials(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTutorials(nextPage, true);
  };

  return (
    <div
      id="tutorials-container"
      className="flex min-h-screen bg-background flex-col relative"
    >
      <TopNavBar />
      <div
        id="tutorials-content-container"
        className="flex flex-col px-4 sm:px-8 py-8 gap-10 w-full max-w-5xl mx-auto flex-1 overflow-y-auto"
      >
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Tutorials
            </h1>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-gray-500">Loading tutorials...</span>
            </div>
          ) : tutorials.length === 0 ? (
            <div className="flex justify-center py-10">
              <span className="text-gray-500">No tutorials found.</span>
            </div>
          ) : (
            <>
              {tutorials.map((t) => (
                <TutorialCard
                  key={t.tutorial_id}
                  id={t.tutorial_id}
                  title={t.title}
                  content={t.content}
                  author={t.user_name}
                  avatarUrl={t.profile_url}
                  createdAt={new Date(t.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  avgRating={Number(t.avg_rating) || 0}
                  totalInteractions={Number(t.total_interactions) || 0}
                  videoUrl={t.embedded_video_url}
                  linkedQuestions={t.linked_questions}
                />
              ))}
              
              {hasMore && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}