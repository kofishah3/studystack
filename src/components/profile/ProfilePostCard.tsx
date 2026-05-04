import React from "react";
import { ArrowUp, Edit, MessageSquare, Trash } from "lucide-react";
import IconButton from "../inputs/IconButton";

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
      <div className="flex flex-row items-center mt-1">
        <IconButton
          icon={ArrowUp}
          label={String(upvotes)}
          iconColor="muted"
          iconSize={14}
        />
        <IconButton
          icon={MessageSquare}
          label={`${comments} Comments`}
          iconColor="muted"
          iconSize={14}
        />
        <div className="flex-1" />
        <div className="flex items-center text-xs font-medium ">
          <IconButton
            icon={Edit}
            onClick={onEdit}
            iconColor="muted"
            iconSize={14}
          />
          <IconButton
            icon={Trash}
            onClick={onDelete}
            iconColor="red-500"
            hoverBg="hover:bg-red-500/10"
            iconSize={14}
          />
        </div>
      </div>
    </div>
  );
}
