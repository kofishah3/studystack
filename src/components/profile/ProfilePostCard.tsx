import React from "react";
import { ArrowUp, MessageSquare } from "lucide-react";

interface ProfilePostCardProps {
  title: string;
  type: string;
  timeAgo: string;
  upvotes: number | string;
  comments: number | string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProfilePostCard({
  title,
  type,
  timeAgo,
  upvotes,
  comments,
  onEdit,
  onDelete,
}: ProfilePostCardProps) {
  return (
    <div className="flex flex-col p-5 bg-surface border border-border rounded-xl shadow-sm gap-3 hover:border-primary-300 transition-colors duration-200">
      <h3 className="text-base font-semibold font-sora text-text">{title}</h3>
      <div className="flex flex-row items-center gap-3">
        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
          {type}
        </span>
        <span className="text-xs text-muted">{timeAgo}</span>
      </div>
      <div className="flex flex-row items-center gap-4 mt-1">
        <div className="flex items-center gap-1 text-muted text-xs font-medium">
          <ArrowUp size={14} />
          <span>{upvotes}</span>
        </div>
        <div className="flex items-center gap-1 text-muted text-xs font-medium">
          <MessageSquare size={14} />
          <span>{comments}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs font-medium">
          <button
            onClick={onEdit}
            className="text-muted hover:text-text transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
