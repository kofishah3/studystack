import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import Link from "next/link";

export type TutorialCardProps = {
  id: string;
  title: string;
  content: string;
  author: string;
  avatarUrl?: string;
  createdAt: string;
  avgRating?: number;
  totalInteractions?: number;
  videoUrl?: string | null;
  linkedQuestions?: {
    question_id: string;
    title: string;
    author_name: string;
  }[];
};

export default function TutorialCard({
  id,
  title,
  content,
  author,
  avatarUrl,
  createdAt,
  avgRating = 0,
  totalInteractions = 0,
  videoUrl,
  linkedQuestions = [],
}: TutorialCardProps) {
  const ratingColor =
    avgRating >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : avgRating >= 2.5
        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  return (
    <div
      className="
      w-full max-w-7xl mx-auto p-3.5
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm
      hover:shadow-md transition-shadow"
      id={`tutorial-card-${id}`}
    >
      <div className="flex gap-4">
        <div
          className="shrink-0 flex flex-col items-center justify-center"
          id={`rating-container-${id}`}
        >
          <div
            className={`flex flex-col items-center justify-center w-10 h-8 sm:w-14 sm:h-10 rounded-lg border text-center font-bold ${ratingColor}`}
            id={`rating-badge-${id}`}
          >
            <span className="text-sm sm:text-lg leading-none">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs mt-1 text-gray-400 font-semibold ">
            Rating
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/tutorials/${id}`}
              className="group flex-1"
              id={`tutorial-link-${id}`}
            >
              <h2
                className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight 
              transition-colors group-hover:text-primary-700"
              >
                {title}
              </h2>
            </Link>
          </div>

          {linkedQuestions.length > 0 && (
            <div className="flex items-center gap-2 -mt-0.5 mb-1.5">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {linkedQuestions.map((q) => (
                  <Link
                    key={q.question_id}
                    href={`/questions/${q.question_id}`}
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-700 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-xs text-gray-400 font-normal ">
                      Made for Question:
                    </span>
                    <span className="italic">"{q.title}"</span>
                    <span className="text-xs text-gray-400 font-normal ">
                      by
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 font-bold">
                      {q.author_name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div
            className="flex flex-wrap items-center gap-2"
            id={`tutorial-meta-${id}`}
          >
            <UserMeta
              name={author}
              createdAt={createdAt}
              avatarUrl={avatarUrl}
            />
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700 text-xs">
              |
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {totalInteractions} interaction
              {totalInteractions !== 1 ? "s" : ""}
            </span>
          </div>

          <p
            className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2"
            id={`tutorial-body-${id}`}
          >
            {content}
          </p>
        </div>

        <div className="shrink-0" id={`action-menu-container-${id}`}>
          <ActionMenu />
        </div>
      </div>
    </div>
  );
}
