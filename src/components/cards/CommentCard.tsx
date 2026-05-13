"use client";

import ActionMenu from "../ui/ActionMenu";
import UserMeta from "../ui/UserMeta";

export interface CommentCardProps {
  authorName: string;
  createdAt: string;
  body: string;
  avatarUrl?: string;
}

export function CommentCard({
  authorName,
  createdAt,
  body,
  avatarUrl,
}: CommentCardProps) {
  return (
    <div className="group flex gap-3 transition-colors bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <UserMeta
            name={authorName}
            createdAt={new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            avatarUrl={avatarUrl}
            size="sm"
          />
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionMenu />
          </div>
        </div>

        <p className="leading-relaxed text-xs text-gray-500 dark:text-gray-400">
          {body}
        </p>
      </div>
    </div>
  );
}
