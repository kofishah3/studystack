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
    <div className="flex flex-col p-4 bg-surface/30 border border-border/60 rounded-2xl gap-4 hover:border-primary-500/40 hover:bg-surface/50 transition-all duration-300 group">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-primary-500/10 text-primary-700 dark:text-primary-400 rounded-full border border-primary-500/20">
            {type}
          </span>
          <span className="text-xs font-medium text-muted/60 tracking-tight">
            {timeAgo}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-bold font-sora text-text leading-tight group-hover:text-primary-500 transition-colors duration-300">
          {title}
        </h3>
      </div>

      <div className="flex flex-row items-center justify-between mt-auto pt-2 border-t border-border/30">
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted group-hover:text-text transition-colors duration-300">
            <ArrowUp
              size={14}
              className={Number(upvotes) > 0 ? "text-green-500" : ""}
            />
            <span className="text-xs font-bold">{upvotes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted group-hover:text-text transition-colors duration-300">
            <MessageSquare size={14} />
            <span className="text-xs font-bold">{comments}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <IconButton
            icon={Edit}
            onClick={onEdit}
            iconColor="muted"
            iconSize={14}
            className="hover:text-primary-500"
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
