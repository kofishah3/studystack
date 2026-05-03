// components/cards/QuestionCard.tsx

import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/SubjectTag";

type Props = {
  title: string;
  body: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt?: string;
  answers: number;
};

export default function QuestionCard({
  title,
  body,
  tags,
  author,
  createdAt,
  updatedAt,
  answers,
}: Props) {
  return (
    <div className="p-4 flex flex-col gap-4">

      <div className="flex justify-between items-start gap-4">

        <h2 className="text-lg font-semibold flex-1">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          
          <button className="bg-green-500 text-white text-sm px-3 py-1.5 rounded-md hover:bg-green-600 transition">
            Create Tutorial
          </button>

          <ActionMenu />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
 
        <UserMeta
          name={author}
          createdAt={createdAt}
          updatedAt={updatedAt}
        />

        <div className="flex px-10 gap-5 flex-wrap">
          {tags.map((tag, i) => (
            <SubjectTag key={i} label={tag} />
          ))}
        </div>
      </div>

      <p className="text-sm">
        {body}
      </p>

      <div className="text-sm text-gray-500">
        {answers} answers
      </div>

    </div>
  );
}