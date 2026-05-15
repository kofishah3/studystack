"use client";

import QuestionCard from "@/components/cards/QuestionCard";
import TutorialCard from "@/components/cards/TutorialCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import FeedSettings, { FeedSettingsState } from "@/components/feed/FeedSettings";
import { useEffect, useState, useCallback } from "react";

import { useQuestionActions } from "@/hooks/useQuestionActions";

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setItems((prev) =>
          prev.filter(
            (item) =>
              item.type !== "question" || String(item.data.question_id) !== id,
          ),
        );
      });
    },
    [deleteQuestion],
  );

  const fetchFeed = useCallback(async (currentSettings: FeedSettingsState) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: "20",
        sort: currentSettings.sort,
        schoolFilter: currentSettings.schoolFilter,
        degreeFilter: currentSettings.degreeFilter,
        timeFilter: currentSettings.timeFilter,
      });

      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/feed?${params}`, { headers });
      const json = await res.json();
      setItems(json.data || []);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(settings);
  }, [fetchFeed, settings]);

  return (
    <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
      <div className="w-full flex flex-col gap-6 pb-12">
        <div id="home-feed-header" className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text">Community Feed</h1>
          <FeedSettings 
            initialSettings={settings} 
            onSettingsChange={setSettings} 
          />
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-6">
            {items.map((item, idx) => (
              <div
                key={`${item.type}-${item.data.id}-${idx}`}
                className="opacity-0 animate-[fade-in_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {item.type === "question" ? (
                  <QuestionCard 
                    {...item.data} 
                    mode="preview" 
                    currentUserId={currentUserId}
                    onDelete={handleDeleteQuestion}
                  />
                ) : (
                  <TutorialCard {...item.data} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nothing here yet
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-1">
              Start by asking a question or creating a tutorial to populate the
              community feed.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
