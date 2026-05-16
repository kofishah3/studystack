import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  label?: string;
  icon: LucideIcon;
  iconColor: string;
  labelColor?: string;
  hoverBg?: string;
  iconSize?: number;
  onClick?: () => void;
  className?: string;
}

export default function IconButton({
  label,
  icon: Icon,
  iconColor,
  labelColor = iconColor,
  hoverBg = "hover:bg-primary-100/40",
  iconSize = 14,
  onClick,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-${labelColor} p-2 rounded-full text-xs
      ${hoverBg} transition-all duration-200 cursor-pointer flex items-center gap-2 ${className}`}
    >
      <Icon size={iconSize} />
      {label && <span>{label}</span>}
    </button>
  );
}
