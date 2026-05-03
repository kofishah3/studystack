import BaseCard from "./BaseCard";
import VotePanel from "../ui/VotePanel";

type Props = {
  body: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  comments: number;
  votes: number;
};

export default function AnswerCard({
  body,
  author,
  createdAt,
  updatedAt,
  comments,
  votes,
}: Props) {
  return (
    <div className="flex gap-4">
      <VotePanel votes={votes} />

      <div className="flex-1">
        <BaseCard
          author={author}
          createdAt={createdAt}
          updatedAt={updatedAt}
          body={body}
        >
          <div
            className="flex justify-between items-center text-sm mt-2"
          >

            <button className="text-blue-500 hover:underline">
              Open Comments ({comments})
            </button>
            
            <button
              className="text-green-500 hover:underline"
            >
              Is this helpful?
            </button>

          </div>
        </BaseCard>
      </div>
    </div>
  );
}