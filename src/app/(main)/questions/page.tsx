"use client";
import { useEffect, useState, useCallback } from "react";
import QuestionCard from "@/components/cards/QuestionCard";
import AskQuestionCard from "@/components/inputs/CreateCards/CreateQuestion";
import { SkeletonList } from "@/components/ui/SkeletonCard";
import SearchBar from "@/components/inputs/SearchBar";
import FeedSettings, {
  FeedSettingsState,
} from "@/components/feed/FeedSettings";

import { useQuestionActions } from "@/hooks/useQuestionActions";

const CATEGORIES = ["All", "CMSC", "Math", "Physics", "Others"];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<FeedSettingsState>({
    sort: "demand",
    schoolFilter: "all",
    degreeFilter: "all",
    timeFilter: "all",
  });

  const { currentUserId, deleteQuestion } = useQuestionActions();

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      deleteQuestion(id, () => {
        setQuestions((prev) => prev.filter((q) => String(q.question_id) !== id));
      });
    },
    [deleteQuestion],
  );

  const fetchQuestions = useCallback(
    async (
      pageNum: number,
      append = false,
      currentSettings: FeedSettingsState,
    ) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams({
          page: String(pageNum),
          sort: currentSettings.sort,
          schoolFilter: currentSettings.schoolFilter,
          degreeFilter: currentSettings.degreeFilter,
          timeFilter: currentSettings.timeFilter,
        });
        if (selectedCategory !== "All")
          params.append("category", selectedCategory);
        if (searchQuery.trim()) params.append("search", searchQuery.trim());

        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/questions?${params}`, { headers });
        const json = await res.json();

        if (json.data) {
          setQuestions((prev) =>
            append ? [...prev, ...json.data] : json.data,
          );
          setHasMore(json.data.length === 20);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchQuery],
  );

  useEffect(() => {
    setPage(1);
    fetchQuestions(1, false, settings);
  }, [fetchQuestions, settings]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(nextPage, true, settings);
  };

  return (
    <div
      id="questions-content-container"
      className="flex flex-col px-4 sm:px-8 py-8 gap-6 flex-1 overflow-y-auto"
    >
      <div className="w-full flex flex-col gap-6">
        <AskQuestionCard />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text">Questions</h2>
            <FeedSettings
              initialSettings={settings}
              onSettingsChange={setSettings}
            />
          </div>
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
                created_at={q.created_at}
                resolved_at={q.resolved_at ?? null}
                user_name={q.user_name}
                profile_url={q.profile_url ?? null}
                institution={q.institution}
                degree_program={q.degree_program}
                upvotes={q.upvotes}
                downvotes={q.downvotes}
                user_vote={q.user_vote}
                answers={q.answers ?? []}
                mode="preview"
                currentUserId={currentUserId}
                onDelete={handleDeleteQuestion}
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
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
