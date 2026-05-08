"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import QuestionCard from "@/components/cards/QuestionCard";
import type { AnswerProps } from "@/components/cards/AnswerCard";
import AskQuestionCard from "@/components/inputs/CreateCards/CreateQuestion";

export default function QuestionsPage() {
  // MOCK ANSWERS
  const mockAnswers: AnswerProps[] = [
    {
      id: "answer-1",
      credibilityScore: 91,
      authorName: "John Carter",
      body:
        "TypeScript becomes easier when you start defining reusable interfaces for your components. You should also separate UI components from business logic whenever possible.",

      createdAt: "May 7, 2026",
      updatedAt: "May 8, 2026",

      mediaURLs: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
        },
      ],

      isResolved: true,

      totalComments: 4,
      totalUpVotes: 21,
      totalDownVotes: 2,
      userVote: "up",

      onVoteUp: (id) => console.log("Upvoted:", id),
      onVoteDown: (id) => console.log("Downvoted:", id),
      onResolved: (id) => console.log("Resolved:", id),
      onHelpful: (id) => console.log("Helpful:", id),
    },

    {
      id: "answer-2",
      credibilityScore: 63,
      authorName: "Maria Santos",
      body:
        "You can improve maintainability by creating a shared type file for all cards. That way, QuestionCard, AnswerCard, and CommentCard all share consistent structures.",

      createdAt: "May 6, 2026",

      mediaURLs: [
        {
          type: "video",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
        },
      ],

      isResolved: false,

      totalComments: 2,
      totalUpVotes: 10,
      totalDownVotes: 1,
      userVote: null,

      onVoteUp: (id) => console.log("Upvoted:", id),
      onVoteDown: (id) => console.log("Downvoted:", id),
    },

    {
      id: "answer-3",
      credibilityScore: 28,
      authorName: "Random User",
      body:
        "I think you should just put everything in one component file so it's easier to manage.",

      createdAt: "May 5, 2026",

      isResolved: false,

      totalComments: 0,
      totalUpVotes: 1,
      totalDownVotes: 8,
      userVote: "downvote",

      onVoteUp: (id) => console.log("Upvoted:", id),
      onVoteDown: (id) => console.log("Downvoted:", id),
    },
  ];

  return (
    <div
      id="questionspage-container"
      className="
        flex flex-col
        h-[calc(100vh-1.5rem)]
        m-3
        rounded-xl
        border border-border
        bg-background
      "
    >
      {/* FIXED NAVBAR */}
      <TopNavBar />

      {/* SCROLLABLE CONTENT */}
      <div
        className="
          flex-1
          overflow-y-auto
          p-4
        "
      >
        <div className="w-full flex flex-col gap-4">

          {/* ASK QUESTION */}
          <AskQuestionCard />

          {/* QUESTION 1 */}
          <QuestionCard
            id="question-1"
            demandRate={88}
            questionTitle="How do I properly structure reusable React card components in Next.js with TypeScript?"
            profileURL="https://i.pravatar.cc/150?img=12"
            author="Isabella Recilla"
            subjectTag={["React", "Next.js", "TypeScript"]}
            createdAt="May 8, 2026"
            updatedAt="May 8, 2026"
            body="I'm currently building reusable QuestionCard, AnswerCard, and CommentCard components. I want them to support nesting, voting, credibility badges, and expandable answers while keeping the code clean and maintainable."
            answers={mockAnswers}
            totalUpVotes={45}
            totalDownVotes={3}
            onCreateTutorial={(id) =>
              console.log("Create tutorial for:", id)
            }
          />

          {/* QUESTION 2 */}
          <QuestionCard
            id="question-2"
            demandRate={54}
            questionTitle="What is the best way to manage deeply nested comments in React?"
            profileURL="https://i.pravatar.cc/150?img=25"
            author="Alex Rivera"
            subjectTag={["Frontend", "Architecture", "UI"]}
            createdAt="May 7, 2026"
            body="I want Reddit-style nested comments but I'm worried about performance and recursive rendering issues."
            answers={mockAnswers.slice(0, 2)}
            totalUpVotes={18}
            totalDownVotes={1}
            onCreateTutorial={(id) =>
              console.log("Create tutorial for:", id)
            }
          />

          {/* QUESTION 3 */}
          <QuestionCard
            id="question-3"
            demandRate={23}
            questionTitle="Should all reusable component props be stored in one shared types folder?"
            profileURL="https://i.pravatar.cc/150?img=33"
            author="Kevin Lee"
            subjectTag={["TypeScript", "Project Structure"]}
            createdAt="May 5, 2026"
            body="I'm unsure whether I should centralize all interfaces or keep types close to their components."
            answers={[]}
            totalUpVotes={7}
            totalDownVotes={5}
            onCreateTutorial={(id) =>
              console.log("Create tutorial for:", id)
            }
          />
        </div>
      </div>
    </div>
  );
}