"use client";
import React from "react";
import AnswerCard, { AnswerProps } from "../cards/AnswerCard";
import { MessageSquare, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProfileAnswerCardProps extends AnswerProps {
  questionId: string;
  questionTitle: string;
  questionAuthorName: string;
}

export default function ProfileAnswerCard(props: ProfileAnswerCardProps) {
  return (
    <div
      className="flex flex-col group"
      id={`profile-answer-card-wrapper-${props.answer_id}`}
    >
      <div className="relative z-10" id={`profile-answer-card-${props.answer_id}`}>
        <AnswerCard {...props} />
      </div>
      <div
        id={`profile-answer-footer-context-${props.answer_id}`}
        className="
          -mt-2 pt-4 pb-2.5 px-4 
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
          id={`answer-footer-left-${props.answer_id}`}
        >
          <div className="p-1.5 rounded-lg bg-background border border-border/50 text-muted shrink-0">
            <MessageSquare size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-muted leading-none">
              Answered for
            </span>
            <Link
              id={`answer-footer-question-link-${props.answer_id}`}
              href={`/questions/${props.questionId}`}
              className="text-xs font-semibold text-text truncate hover:text-primary-500 transition-colors mt-0.5"
            >
              {props.questionTitle}
            </Link>
          </div>
        </div>

        <div
          className="flex items-center justify-between sm:justify-end gap-4 shrink-0"
          id={`answer-footer-right-${props.answer_id}`}
        >
          <div
            className="flex items-center gap-1.5"
            id={`answer-footer-author-meta-${props.answer_id}`}
          >
            <span className="text-xs text-muted font-medium">
              by <span className="text-text">{props.questionAuthorName}</span>
            </span>
          </div>

          <Link
            id={`answer-footer-view-question-btn-${props.answer_id}`}
            href={`/questions/${props.questionId}`}
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
    </div>
  );
}
