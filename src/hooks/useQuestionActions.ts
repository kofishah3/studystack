"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";

export function useQuestionActions() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUserId(JSON.parse(userStr).user_id);
      } catch (e) {}
    }
  }, []);

  const deleteQuestion = useCallback(
    async (id: string, onSuccess?: () => void) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`/api/questions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to delete question");
        }

        showToast({
          type: "success",
          title: "Deleted",
          message: "Question deleted successfully",
        });

        onSuccess?.();
      } catch (error: any) {
        showToast({ type: "error", title: "Error", message: error.message });
      }
    },
    [showToast],
  );

  return { currentUserId, deleteQuestion };
}
