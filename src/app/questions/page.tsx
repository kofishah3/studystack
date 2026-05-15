// PATH: src/app/questions/page.tsx  (replace existing file)

"use client";
import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavBar from "@/components/navigation/TopNavigationBar";
import QuestionCard from "@/components/cards/QuestionCard";
import AskQuestionCard from "@/components/inputs/CreateCards/CreateQuestion";
import { SkeletonList } from "@/components/ui/SkeletonCard";
import SearchBar from "@/components/inputs/SearchBar";

const CATEGORIES = ["All", "CMSC", "Math", "Physics", "Others"];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // FIX: fetchQuestions is now a useCallback that captures the latest
  // selectedCategory and searchQuery, so handleLoadMore never uses stale values.
  const fetchQuestions = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams({ page: String(pageNum) });
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (searchQuery.trim()) params.append("search", searchQuery.trim());

        const res = await fetch(`/api/questions?${params}`);
        const json = await res.json();

        if (json.data) {
          setQuestions((prev) => (append ? [...prev, ...json.data] : json.data));
          setHasMore(json.data.length === 20);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // Re-create when filters change so handleLoadMore always has fresh values
    [selectedCategory, searchQuery],
  );

  // Reset to page 1 and refetch whenever filters change
  useEffect(() => {
    setPage(1);
    fetchQuestions(1);
  }, [fetchQuestions]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(nextPage, true);
  };

  return (
    <div
      id="questions-container"
      className="flex h-screen bg-background flex-col overflow-hidden"
    >
      <TopNavBar />
      <div className="flex flex-row flex-1 w-full overflow-hidden">
        <Sidebar />
        <div
          id="questions-content-container"
          className="flex flex-col px-4 sm:px-8 py-8 gap-6 flex-1 overflow-y-auto"
        >
          <div className="w-full flex flex-col gap-6">
            <AskQuestionCard />

            <div className="flex flex-col gap-4">
              <SearchBar
                placeholder="Search questions..."
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
            ) : (
              <>
                {questions.map((q) => (
                  <QuestionCard
                    key={q.question_id}
                    question_id={q.question_id}
                    user_id={q.user_id}
                    title={q.title}
                    content={q.content}
                    category={q.category ?? ""}
                    demand_score={q.demand_score}
                    created_at={q.created_at}
                    resolved_at={q.resolved_at ?? null}
                    user_name={q.user_name}
                    profile_url={q.profile_url ?? null}
                    answers={q.answers ?? []}
                    mode="preview"
                    onCreateTutorial={(id) =>
                      console.log("Create tutorial for:", id)
                    }
                  />
                ))}

                {hasMore && questions.length > 0 && (
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
    </div>
  );
}