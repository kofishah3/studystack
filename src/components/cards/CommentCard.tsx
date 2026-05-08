"use client";

import ActionMenu from "../ui/ActionMenu";

export interface CommentCardProps {
  authorName: string;
  createdAt: string;
  body: string;
}


export function CommentCard({
  authorName,
  createdAt,
  body,
}: CommentCardProps) {
  return (
    <div className="group flex gap-2.5 border-b border-gray-100 last:border-0 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed">
          {body}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          — {authorName}
        </p>
      </div>

      <div className="flex items-start gap-1 pt-0.5 shrink-0">
        <ActionMenu/>
      </div>
    </div>
    
  )
}