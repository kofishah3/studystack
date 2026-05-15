import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import Link from "next/link";
import { HelpCircle, User, ArrowRight } from "lucide-react";

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
      className="flex flex-col group w-full"
      id={`tutorial-card-wrapper-${id}`}
    >
      <div
        className="
        relative z-10
        w-full p-3.5
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

          <div
            className="flex-1 min-w-0 flex flex-col gap-1.5"
            id={`tutorial-content-${id}`}
          >
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/tutorials/${id}`}
                className="group/link flex-1"
                id={`tutorial-link-${id}`}
              >
                <h2
                  className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight 
                transition-colors group-hover/link:text-primary-700"
                >
                  {title}
                </h2>
              </Link>
            </div>

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

      {linkedQuestions.length > 0 && (
        <div
          id={`tutorial-footer-context-${id}`}
          className="
            pt-4 pb-2.5 px-4 
            bg-surface/30 dark:bg-surface/10 
            border-x border-b border-border/60 
            rounded-b-2xl 
            flex flex-col sm:flex-row sm:items-center justify-between gap-2
            transition-all duration-300
            group-hover:bg-surface/50 dark:group-hover:bg-surface/20
          "
        >
          <div
            className="flex items-center gap-2.5 min-w-0"
            id={`footer-context-left-${id}`}
          >
            <div className="p-1.5 rounded-lg bg-background border border-border/50 text-muted shrink-0">
              <HelpCircle size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-muted leading-none">
                Inspired by Question
              </span>
              <Link
                id={`footer-question-link-${id}`}
                href={`/questions/${linkedQuestions[0].question_id}`}
                className="text-xs font-semibold text-text truncate hover:text-primary-500 transition-colors mt-0.5"
              >
                {linkedQuestions[0].title}
              </Link>
            </div>
          </div>

          <div
            className="flex items-center justify-between sm:justify-end gap-4 shrink-0"
            id={`footer-context-right-${id}`}
          >
            <div
              className="flex items-center gap-1.5"
              id={`footer-author-meta-${id}`}
            >
              <span className="text-xs text-muted font-medium">
                by{" "}
                <span className="text-text">
                  {linkedQuestions[0].author_name}
                </span>
              </span>
            </div>

            <Link
              id={`footer-view-question-btn-${id}`}
              href={`/questions/${linkedQuestions[0].question_id}`}
              className="
                flex items-center gap-1 text-[10px] font-bold text-primary-500 
                hover:text-primary-700 uppercase
                bg-primary-500/5 px-2 py-1 rounded-md transition-colors
              "
            >
              View Question
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
