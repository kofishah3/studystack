"use client";

import React, { useState, useEffect, useRef } from "react";
import FullButton from "./FullButton";

interface CommentInputProps {
  id: string;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  avatarUrl?: string;
}

export default function CommentInput({
  id,
  placeholder = "Add a comment...",
  onSubmit,
  avatarUrl: initialAvatar,
}: CommentInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(
    initialAvatar || null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!initialAvatar) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.profile_url) {
            setUserAvatar(user.profile_url);
          } else if (user?.user_name) {
            setUserAvatar(
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_name}`,
            );
          }
        } catch (e) {}
      }
    }
  }, [initialAvatar]);

  const handleFocus = () => setIsFocused(true);

  const handleCancel = () => {
    setContent("");
    setIsFocused(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit(content);
      setContent("");
      setIsFocused(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div id={`${id}-container`} className="flex gap-4 w-full group">
      <div id={`${id}-avatar-container`} className="shrink-0 mt-1">
        <img
          id={`${id}-avatar`}
          src={
            userAvatar ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
          }
          alt="User avatar"
          className="w-10 h-10 rounded-full border border-border object-cover"
        />
      </div>

      <div
        id={`${id}-content-container`}
        className="flex-1 flex flex-col gap-3"
      >
        <div id={`${id}-textarea-wrapper`} className="relative">
          <textarea
            id={`${id}-textarea`}
            ref={textareaRef}
            placeholder={placeholder}
            value={content}
            onFocus={handleFocus}
            onChange={handleChange}
            className="w-full bg-transparent border-b border-border/60 focus:border-primary-500 py-1.5 resize-none outline-none text-sm transition-all duration-300 min-h-[32px] overflow-hidden"
            rows={1}
          />
        </div>

        {isFocused && (
          <div
            id={`${id}-actions`}
            className="flex justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <button
              id={`${id}-cancel-btn`}
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-bold text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <div className="w-fit">
              <FullButton
                id={`${id}-submit-btn`}
                label="Comment"
                onClick={handleSubmit}
                disabled={!content.trim()}
                isLoading={isLoading}
                className="py-1.5 px-6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
