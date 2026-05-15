import { LucideIcon } from "lucide-react";

interface NavBarButtonProps {
  icon: LucideIcon;
  label: string;
  isSelected: boolean;
}

export default function NavBarButton({
  icon: Icon,
  label,
  isSelected,
}: NavBarButtonProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl 
        transition-all duration-300 group cursor-pointer relative overflow-hidden min-w-[65px]
        ${isSelected ? "bg-primary-500/10" : "hover:bg-primary-500/5"}
      `}
    >
      <div
        className={`transition-all duration-300 transform group-hover:-translate-y-0.5
          ${isSelected ? "text-primary-500 scale-110" : "text-muted group-hover:text-primary-500"}
        `}
      >
        <Icon size={22} strokeWidth={2} />
      </div>

      <span
        className={`text-[11px] font-bold font-sora mt-1 transition-all duration-300 tracking-tight
          ${isSelected ? "text-primary-700" : "text-muted group-hover:text-primary-500"}
        `}
      >
        {label}
      </span>

      {isSelected && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
      )}
    </div>
  );
}
