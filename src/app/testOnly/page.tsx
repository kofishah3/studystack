import QuestionCard from "@/components/cards/QuestionCard";
import AnswerCard from "@/components/cards/AnswerCard";
import CommentCard from "@/components/cards/CommentCard";

export default function CardsTestPage() {
  const question = {
    title: "How does JWT authentication work in Next.js?",
    body: "I'm trying to understand how JWT works with API routes and cookies. Can someone explain the flow and best practices?",
    tags: ["nextjs", "jwt", "authentication"],
    author: "JohnDoe",
    createdAt: "2 hours ago",
    answers: 2,
  };

  const answers = [
    {
      body: "JWT works by signing a payload on login and verifying it on each request...",
      author: "JaneSmith",
      createdAt: "1 hour ago",
      votes: 5,
      comments: [
        {
          body: "This explanation is really clear!",
          author: "User123",
          createdAt: "45 mins ago",
          votes: 2,
        },
        {
          body: "Can you show an example with cookies?",
          author: "DevGuy",
          createdAt: "30 mins ago",
          votes: 1,
        },
      ],
    },
    {
      body: "You should also consider using HTTP-only cookies for better security...",
      author: "SecurityPro",
      createdAt: "50 mins ago",
      votes: 3,
      comments: [
        {
          body: "Good point about cookies.",
          author: "AnotherUser",
          createdAt: "20 mins ago",
          votes: 0,
        },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">

      {/* QUESTION */}
      <QuestionCard {...question} />

      {/* ANSWERS */}
      <div className="flex flex-col gap-6">
        {answers.map((answer, i) => (
          <div key={i} className="flex flex-col gap-4">

            {/* Answer */}
            <AnswerCard
              body={answer.body}
              author={answer.author}
              createdAt={answer.createdAt}
              votes={answer.votes}
              comments={answer.comments.length}
            />

            {/* Comments (nested under answer) */}
            <div className="ml-12 flex flex-col gap-3 border-l pl-4">
              {answer.comments.map((comment, j) => (
                <CommentCard
                  key={j}
                  body={comment.body}
                  author={comment.author}
                  createdAt={comment.createdAt}
                  votes={comment.votes}
                />
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}