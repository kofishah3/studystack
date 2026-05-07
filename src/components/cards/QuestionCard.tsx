"use client";
import { useState } from "react";
import UserMeta from "../ui/UserMeta";
import ActionMenu from "../ui/ActionMenu";
import SubjectTag from "../ui/SubjectTag";
import AnswerCard from "./AnswerCard";
import VotePanel from "../inputs/VotePanel";
import type { AnswerProps } from "./AnswerCard";

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
      w-full max-w-7xl mx-auto p-4
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 rounded-xl"
    >
      {/* TOP ROW: COL1 + COL2 header + COL3 */}
      <div className="flex gap-4">

        {/* COL 1: Demand Rate */}
        <div className="shrink-0 flex flex-col items-center">
          <div className={`flex flex-col items-center justify-center w-16 h-10 rounded-lg border text-center ${demandColor}`}>
            <span className="text-xl font-bold leading-none">{demandRate}</span>
          </div>
        </div>

        {/* COL 2: Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Title row + Create Tutorial */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {questionTitle}
            </h2>
            <button
              onClick={() => onCreateTutorial?.(id)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap"
            >
              + Create Tutorial
            </button>
          </div>

          {/* UserMeta + Tags */}
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

          {/* Body */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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

        {/* COL 3: Action Menu */}
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