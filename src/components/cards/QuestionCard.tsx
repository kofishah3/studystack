"use client";
import { useState } from "react";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/Tag";
import AnswerCard from "./AnswerCard";
import type { AnswerProps } from "./AnswerCard";
import FullButton from "../inputs/FullButton";

export type QuestionProps = {
  id: string;
  demandRate: number;
  questionTitle: string;

  profileURL?: string;
  author: string;
  subjectTag: string[];
  createdAt: string;
  updatedAt?: string;

  body: string;
  answers: AnswerProps[];

  totalUpVotes: number;
  totalDownVotes: number;

  onCreateTutorial?: (id: string) => void;
};

export default function QuestionCard({
  id,
  demandRate,
  questionTitle,
  profileURL,
  author,
  subjectTag,
  createdAt,
  updatedAt,
  body,
  answers,
  totalUpVotes,
  totalDownVotes,
  onCreateTutorial,
}: QuestionProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  const demandColor =
    demandRate >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
      : demandRate >= 40
      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";

  return (
    <div className="
      w-full max-w-7xl mx-auto p-3.5
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
    >
      <div className="flex gap-4">

        {/* COL 1: Demand Rate */}
        <div className="shrink-0 flex flex-col items-center">
          <div className={`flex flex-col items-center justify-center w-14 h-9 rounded-lg border text-center ${demandColor}`}>
            <span className="text-lg font-bold leading-none">{demandRate}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
              {questionTitle}
            </h2>

            <FullButton
              label="Create Tutorial"
              size="sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <UserMeta
              name={author}
              createdAt={createdAt}
              updatedAt={updatedAt}
              avatarUrl={profileURL}
            />
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <div className="flex flex-wrap gap-1.5">
              {subjectTag.map((tag) => (
                <SubjectTag key={tag} label={tag} />
              ))}
            </div>
          </div>

          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
            {body}
          </p>

          {/* Show/Hide Answers toggle */}
          {answers.length > 0 && (
            <button
              onClick={() => setShowAnswers((v) => !v)}
              className="self-start text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
            >
              <span>{showAnswers ? "▴" : "▾"}</span>
              {showAnswers ? "Hide" : "Show"} {answers.length} Answer{answers.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div className="shrink-0">
          <ActionMenu />
        </div>
      </div>

      {/* Answer Cards (full-width beneath the columns) */}
      {showAnswers && answers.length > 0 && (
        <div className="mt-4 ml-20 flex flex-col gap-3">
          {answers.map((answer) => (
            <AnswerCard key={answer.id} {...answer} />
          ))}
        </div>
      )}
    </div>
  );
}