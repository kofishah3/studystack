"use client";

interface FullButtonProps {
  label?: string;

  onClick?: () => void;
  type?: "button" | "submit" | "reset";

  size?: "sm" | "md" | "lg";

  fillColor?:
    | "primary-500"
    | "primary-600"
    | "emerald-500"
    | "red-500"
    | "gray-800";

  hoverColor?:
    | "primary-700"
    | "primary-800"
    | "emerald-700"
    | "red-700"
    | "gray-900";

  borderColor?:
    | "primary-500"
    | "primary-700"
    | "gray-300";
}

const fillColorMap = {
  "primary-500": "bg-primary-500",
  "primary-600": "bg-primary-600",
  "emerald-500": "bg-emerald-500",
  "red-500": "bg-red-500",
  "gray-800": "bg-gray-800",
};

const hoverColorMap = {
  "primary-700": "hover:bg-primary-700",
  "primary-800": "hover:bg-primary-800",
  "emerald-700": "hover:bg-emerald-700",
  "red-700": "hover:bg-red-700",
  "gray-900": "hover:bg-gray-900",
};

const borderColorMap = {
  "primary-500": "border-primary-500",
  "primary-700": "border-primary-700",
  "gray-300": "border-gray-300",
};

const sizeMap = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function FullButton({
  label = "Ok",

  fillColor = "primary-500",
  hoverColor = "primary-700",
  borderColor,

  size = "md",

  onClick,
  type = "button",
}: FullButtonProps) {
  return (
    <button
      id="filledbutton-style-container"
      type={type}
      onClick={onClick}
      className={`
        rounded-xl
        text-center cursor-pointer text-white font-semibold
        transition-all duration-200 active:scale-95

        whitespace-nowrap
        shrink-0

        ${fillColorMap[fillColor]}
        ${hoverColorMap[hoverColor]}
        ${sizeMap[size]}

        ${borderColor ? `border ${borderColorMap[borderColor]}` : ""}
      `}
    >
      {label}
    </button>
  );
}