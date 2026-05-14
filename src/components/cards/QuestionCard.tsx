import Link from "next/link";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/Tag";
import type { AnswerProps } from "./AnswerCard";
import FullButton from "../inputs/FullButton";

export type QuestionProps = {
  id: string;
  demandRate: number;
  questionTitle: string;

  profileURL?: string;
  author: string;
  subjectTag?: string[];
  category?: string;
  createdAt: string;
  updatedAt?: string;

  body: string;
  answers?: AnswerProps[];

  totalUpVotes?: number;
  totalDownVotes?: number;

  onCreateTutorial?: (id: string) => void;
  mode?: "preview" | "full";
};

export default function QuestionCard({
  id,
  demandRate,
  questionTitle,
  profileURL,
  author,
  subjectTag = [],
  category,
  createdAt,
  updatedAt,
  body,
  answers = [],
  mode = "preview",
}: QuestionProps) {
  const demandColor =
    demandRate >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : demandRate >= 40
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  const firstAnswer = answers.length > 0 ? answers[0] : null;
  const tags = [
    ...(category ? category.split(",").map((s) => s.trim()) : []),
    ...subjectTag,
  ].filter((tag, index, self) => tag && self.indexOf(tag) === index);

  return (
    <div
      className={`
      w-full p-3.5 px-5
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm 
      ${mode === "preview" ? "hover:shadow-md transition-shadow" : ""}
    `}
      id={`question-card-${id}`}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/questions/${id}`}
              className="group flex-1"
              id={`question-link-${id}`}
            >
              <h2
                className={`font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight transition-colors ${
                  mode === "full"
                    ? "text-lg leading-tight"
                    : "text-md group-hover:text-primary-700"
                }`}
              >
                {questionTitle}
              </h2>
            </Link>

            {mode === "preview" && (
              <div className="hidden sm:block w-fit">
                <FullButton
                  id={`create-tutorial-btn-top-${id}`}
                  label="Create Tutorial"
                  className="py-1.5 px-4 text-xs"
                  variant="secondary"
                />
              </div>
            )}

            {mode === "full" && (
              <div className="shrink-0 -mt-1 -mr-1" id="question-actions-menu">
                <ActionMenu />
              </div>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            id={`question-meta-${id}`}
          >
            <UserMeta
              name={author}
              createdAt={
                mode === "full"
                  ? new Date(createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : createdAt
              }
              updatedAt={updatedAt}
              avatarUrl={profileURL}
            />
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700 text-xs">
              |
            </span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <SubjectTag key={tag} label={tag} />
              ))}
            </div>
          </div>

          <p
            className={`text-gray-600 dark:text-gray-400 leading-relaxed ${
              mode === "full"
                ? "text-sm whitespace-pre-wrap"
                : "text-xs line-clamp-2"
            }`}
            id={`question-body-${id}`}
          >
            {body}
          </p>

          {mode === "preview" && firstAnswer && (
            <div
              className="mt-1 pl-3 border-l-2 border-primary-100 dark:border-primary-900/30 flex flex-col gap-1"
              id={`top-answer-${id}`}
            >
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                Top Answer
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
                "{firstAnswer.body}"
              </p>
              <Link
                href={`/questions/${id}`}
                className="text-xs font-bold text-gray-500 hover:text-primary-700 transition-colors w-fit"
                id={`view-answers-link-${id}`}
              >
                View {answers.length}{" "}
                {answers.length === 1 ? "answer" : "answers"} →
              </Link>
            </div>
          )}

          {mode === "preview" && (
            <div className="mt-3 block sm:hidden">
              <FullButton
                id={`create-tutorial-btn-mobile-${id}`}
                label="Create Tutorial"
                className="w-full py-2 text-xs"
                variant="secondary"
              />
            </div>
          )}

          {mode === "full" && (
            <div
              className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row 
              items-start sm:items-center gap-4 sm:gap-3"
              id="question-footer-actions"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FullButton
                  label="Helpful"
                  className="flex-1 sm:flex-none sm:w-fit sm:px-5 py-1.5 text-xs"
                  id="helpful-button"
                />
                <button
                  id="share-button"
                  className="text-xs font-semibold text-gray-500 hover:text-primary-700 transition-colors px-3 py-1.5 
                  cursor-pointer flex-1 sm:flex-none
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border sm:border-none border-gray-100 dark:border-gray-800"
                >
                  Share
                </button>
              </div>
              <div className="w-full sm:ml-auto sm:w-auto">
                <FullButton
                  id="create-tutorial-button"
                  label="Create Tutorial"
                  variant="secondary"
                  className="w-full sm:w-fit sm:px-5 py-1.5 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {mode === "preview" && (
          <div className="shrink-0" id={`action-menu-container-${id}`}>
            <ActionMenu />
          </div>
        )}
      </div>
    </div>
  );
}
