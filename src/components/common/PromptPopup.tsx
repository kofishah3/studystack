import { LucideIcon } from "lucide-react";
import FullButton from "../inputs/FullButton";
import { id } from "zod/locales";

type PopupType = "info" | "confirmation";

interface PromptPopupProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  type: PopupType;
  onAccept?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  isVisible: boolean;
}

export default function PromptPopup({
  icon: Icon,
  title,
  description,
  type,
  onAccept,
  onCancel,
  isVisible = false,
}: PromptPopupProps) {
  if (!isVisible) return null;

  return (
    <div
      id="blurred-bg-separator"
      className="fixed inset-0 z-50 flex items-center justify-center
       bg-black/15 backdrop-blur-sm"
    >
      <div
        id="prompt-container"
        className="w-full max-w-md h-fit relative flex flex-col items-center justify-center
         bg-white dark:bg-black gap-5
         shadow-lg p-6 rounded-xl"
      >
        {Icon && (
          <div
            className="p-3 bg-primary-100 text-primary-700 
            dark:bg-primary-900/30 dark:text-primary-400 rounded-full"
          >
            <Icon size={30} strokeWidth={1} />
          </div>
        )}

        <h1 className="text-center text-lg w-full font-bold">{title}</h1>
        <p className="text-center text-sm w-full -mt-3">{description}</p>

        <div className="w-full mt-5" id="buttons-container">
          {type === "info" ? (
            <div id="info-buttons" className="w-full h-fit">
              <FullButton label="Confirm" onClick={onAccept} />
            </div>
          ) : (
            <div
              id="confirmation-buttons"
              className="w-full h-fit flex flex-row gap-3"
            >
              <FullButton
                label="Cancel"
                onClick={onCancel}
                variant="secondary"
              />
              <FullButton label="Confirm" onClick={onAccept} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
