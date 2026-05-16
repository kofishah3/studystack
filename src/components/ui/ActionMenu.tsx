"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Trash } from "lucide-react";
import PromptPopup from "@/components/common/PromptPopup";

export type DeleteTarget =
  | { type: "question"; id: string }
  | { type: "answer"; id: number }
  | { type: "comment"; id: number }
  | { type: "tutorial"; id: string };

interface ActionMenuProps {
  /** Pass this to enable the Delete option. Omit to render a non-functional placeholder. */
  deleteTarget?: DeleteTarget;
  /** Called after the API confirms deletion so the parent can remove the item from state. */
  onDeleted?: () => void;
}

async function callDelete(target: DeleteTarget): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let url: string;
  switch (target.type) {
    case "question":
      url = `/api/questions/${target.id}`;
      break;
    case "answer":
      url = `/api/answers/${target.id}`;
      break;
    case "comment":
      url = `/api/comments/${target.id}`;
      break;
    case "tutorial":
      url = `/api/tutorial/${target.id}`;
      break;
  }

  const res = await fetch(url, { method: "DELETE", headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Delete failed");
  }
}

const TARGET_LABELS: Record<DeleteTarget["type"], string> = {
  question: "Question",
  answer: "Answer",
  comment: "Comment",
  tutorial: "Tutorial",
};

export default function ActionMenu({ deleteTarget, onDeleted }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await callDelete(deleteTarget);
      setShowConfirm(false);
      onDeleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const label = deleteTarget ? TARGET_LABELS[deleteTarget.type] : "Item";

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1 z-30 w-44
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg overflow-hidden"
          >
            {deleteTarget ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowConfirm(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5
                  text-sm text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors"
              >
                <Trash2 size={14} strokeWidth={2} />
                Delete {label}
              </button>
            ) : (
              <p className="px-3 py-2.5 text-xs text-gray-400 select-none">
                No actions available
              </p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <PromptPopup
        icon={Trash}
        title={`Delete ${label}`}
        description={
          error
            ? `Error: ${error}`
            : `Are you sure you want to delete this ${label.toLowerCase()}? This action cannot be undone.`
        }
        type="confirmation"
        isVisible={showConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setError(null);
        }}
        onAccept={handleConfirmDelete}
      />
    </>
  );
}