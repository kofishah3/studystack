"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface FullButtonProps {
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export default function FullButton({
  label = "Ok",
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  id,
  className = "",
}: FullButtonProps) {
  const baseStyles =
    "w-full text-sm py-2.5 px-4 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",
    secondary:
      "bg-transparent ring-1 ring-inset ring-primary-500 text-primary-500 hover:bg-primary-50 disabled:ring-gray-200 disabled:text-gray-400",
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
