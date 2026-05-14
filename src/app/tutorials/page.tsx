"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/TopNavBar";
import TutorialCard from "@/components/cards/TutorialCard";
import { SkeletonList } from "@/components/ui/SkeletonCard";
import SearchBar from "@/components/inputs/SearchBar";

const CATEGORIES = ["All", "CMSC", "Math", "Physics", "Others"];

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchTutorials(pageNum: number, append = false) {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "20",
      });

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/tutorial?${params}`);
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
    setPage(1);
    fetchTutorials(1);
  }, [selectedCategory, searchQuery]);

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
        className="flex flex-col px-4 sm:px-8 py-8 gap-6 w-full max-w-5xl mx-auto flex-1 overflow-y-auto"
      >
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Tutorials
            </h1>

            <SearchBar
              placeholder="Search tutorials..."
              initialValue={searchQuery}
              onSearch={(query) => setSearchQuery(query)}
            />

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <SkeletonList count={5} />
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
                  createdAt={new Date(t.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
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
