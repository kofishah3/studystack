"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextInputProps {
  name: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  id?: string;

  multiline?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

interface TextInputwLabelProps extends TextInputProps {
  label: string;
}

export default function TextInput({
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  id,
  multiline = false,
  rows = 5,
  icon,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div
      id={`${id || name}-container`}
      className="
        group w-full h-fit p-1 cursor-text
        border border-border rounded-xl bg-surface/50
        hover:border-primary-300 hover:ring-1 hover:ring-primary-300
        focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500
        transition-all duration-200 ease-in-out
      "
    >
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange as any}
          className="
            w-full bg-transparent outline-none border-none
            text-text text-sm placeholder:text-muted
            rounded-lg p-2 resize-none
          "
        />
      ) : (
        <div className="flex flex-row justify-between items-center px-2">
          {icon && <div className="mr-2 text-muted">{icon}</div>}
          <input
            id={id}
            type={inputType}
            className="
              w-full bg-transparent outline-none border-none
              text-text text-sm placeholder:text-muted
              rounded-lg p-2
            "
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange as any}
          />

          {type === "password" && (
            <button
              id={`${id || name}-toggle-password`}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted hover:text-primary-500 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TextInputwLabel({
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  id,
  multiline,
  rows,
  icon,
}: TextInputwLabelProps) {
  return (
    <div id={`${id || name}-field-group`} className="flex flex-col gap-1 w-full">
      <p id={`${id || name}-label`} className="font-medium text-text text-sm">{label}</p>

      <TextInput
        id={id}
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        multiline={multiline}
        rows={rows}
        icon={icon}
      />
    </div>
  );
}