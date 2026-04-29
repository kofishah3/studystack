"use client";

interface FullButtonProps {
  label?: string;
  hoverColor?: string;
  fillColor?: string;
  borderColor?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function FullButton({
  label = "Ok",
  fillColor = "primary-500",
  hoverColor = "primary-700",
  borderColor,
  onClick,
  type = "button",
}: FullButtonProps) {
  return (
    <button
      id="filledbutton-style-container"
      type={type}
      onClick={onClick}
      className={`bg-${fillColor} w-full h-fit rounded-lg px-5 py-3 
      text-center cursor-pointer text-white font-semibold
      hover:bg-${hoverColor} transition-all duration-200 active:scale-95
      ${borderColor ? `border border-${borderColor}` : ""}
      `}
    >
      {label}
    </button>
  );
}
