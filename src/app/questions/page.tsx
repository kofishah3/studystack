"use client";
import { useEffect, useState } from "react";
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

  async function fetchQuestions(pageNum: number, append = false) {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: String(pageNum),
      });

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

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
  }

  useEffect(() => {
    setPage(1);
    fetchQuestions(1);
  }, [selectedCategory, searchQuery]);

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
                  id={q.question_id}
                  demandRate={q.demand_score}
                  questionTitle={q.title}
                  profileURL={q.profile_url}
                  author={q.user_name}
                  subjectTag={q.category
                    .split(",")
                    .map((s: string) => s.trim())}
                  createdAt={new Date(q.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                  body={q.content}
                  answers={q.answers.map((a: any) => ({
                    id: String(a.answer_id),
                    credibilityScore: a.author_credibility_score || 0,
                    authorName: a.author_name,
                    body: a.content,
                    mediaURLs: a.media_urls,
                    createdAt: new Date(a.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                    isResolved: a.is_accepted,
                    totalComments: 0,
                    totalUpVotes: 0,
                    totalDownVotes: 0,
                    userVote: null,
                  }))}
                  totalUpVotes={0}
                  totalDownVotes={0}
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
