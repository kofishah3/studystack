"use client";

import React from "react";

interface GoogleAuthButtonProps {
  onClick?: () => void;
  label?: string;
  id?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onClick,
  label = "Continue with Google",
  id = "google-auth-button",
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl 
      border border-border bg-surface hover:bg-primary-50 transition-all duration-200 w-full group active:scale-[0.98]"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
      />
      <span className="text-text font-medium text-sm">{label}</span>
    </button>
  );
};

export default GoogleAuthButton;
