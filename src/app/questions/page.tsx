"use client";
import { useEffect, useState } from "react";
import TopNavBar from "@/components/navigation/topnavbar";
import QuestionCard from "@/components/cards/QuestionCard";
import AskQuestionCard from "@/components/inputs/CreateCards/CreateQuestion";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        const json = await res.json();
        if (json.data) {
          setQuestions(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  return (
    <div
      id="questions-container"
      className="flex min-h-screen bg-background flex-col relative"
    >
      <TopNavBar />

      <div
        id="questions-content-container"
        className="flex flex-col px-4 sm:px-8 py-8 gap-10 w-full max-w-5xl mx-auto flex-1 overflow-y-auto"
      >
        <div className="w-full flex flex-col gap-6">
          <AskQuestionCard />

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-gray-500">Loading questions...</span>
            </div>
          ) : (
            questions.map((q) => (
              <QuestionCard
                key={q.question_id}
                id={q.question_id}
                demandRate={q.demand_score}
                questionTitle={q.title}
                profileURL={q.profile_url}
                author={q.user_name}
                subjectTag={q.category.split(",").map((s: string) => s.trim())}
                createdAt={new Date(q.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
