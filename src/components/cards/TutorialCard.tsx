"use client";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import FullButton from "../inputs/FullButton";

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
  linkedQuestions?: { question_id: string; title: string }[];
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
    <div className="
      w-full max-w-7xl mx-auto p-3.5
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
    >
      <div className="flex gap-4">
        {/* COL 1: Rating */}
        <div className="shrink-0 flex flex-col items-center">
          <div className={`flex flex-col items-center justify-center w-14 h-9 rounded-lg border text-center ${ratingColor}`}>
            <span className="text-lg font-bold leading-none">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </span>
          </div>
          <span className="text-[10px] mt-1 text-gray-500 uppercase font-bold tracking-wider">Rating</span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
                {title}
              </h2>
              {linkedQuestions.length > 0 && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Made for: <span className="italic font-medium">{linkedQuestions.map(q => q.title).join(", ")}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
               {videoUrl && (
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>▶</span> Video
                  </a>
               )}
               <FullButton
                 label="View Tutorial"
                 size="sm"
               />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <UserMeta
              name={author}
              createdAt={createdAt}
              avatarUrl={avatarUrl}
            />
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalInteractions} interaction{totalInteractions !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {content}
          </p>
        </div>

        <div className="shrink-0">
          <ActionMenu />
        </div>
      </div>
    </div>
  );
}
