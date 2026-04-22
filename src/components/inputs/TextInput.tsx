"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextInputProps {
  name: string;
  placeholder?: string;
  type?: string;
}

export default function TextInput({
  name,
  placeholder,
  type = "text",
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div
      id="text-input-container"
      className="group w-full h-fit p-1 cursor-text
      border border-border rounded-xl bg-surface/50
      hover:border-primary-300 hover:ring-1 hover:ring-primary-300
      focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500
      transition-all duration-200 ease-in-out
      flex flex-row justify-between items-center 
      "
    >
      <input
        type={inputType}
        className="w-full bg-transparent outline-none border-none text-text placeholder:text-muted rounded-lg p-2"
        placeholder={placeholder}
        name={name}
      />

      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted hover:text-primary-500 transition-colors p-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}
