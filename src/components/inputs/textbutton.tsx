interface TextButtonProps {
  label?: string;
  textColor: string;
  selectedColor: string;
  hoverColor: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function TextButton({
  label,
  textColor,
  selectedColor,
  hoverColor,
  onClick,
  isSelected,
}: TextButtonProps) {
  return (
    <div
      id="textbutton-container"
      onClick={onClick}
      className={`p-2 text-inter text-sm font-medium transition-all duration-150
         hover:text-${hoverColor} hover:cursor-pointer hover:underline underline-offset-3
        ${isSelected ? `text-${selectedColor} underline ` : `text-${textColor}`}
      `}
    >
      {label}
    </div>
  );
}
