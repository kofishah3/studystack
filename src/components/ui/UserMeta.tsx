import Link from "next/link";

type UserMetaProps = {
  name: string;
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  institution?: string;
  degreeProgram?: string;
  size?: "sm" | "md" | "lg";
};

export default function UserMeta({
  name,
  createdAt,
  updatedAt,
  avatarUrl,
  institution,
  degreeProgram,
  size = "md",
}: UserMetaProps) {
  const sizeClasses = {
    sm: {
      avatar: "w-6 h-6",
      text: "text-[10px]",
      gap: "gap-1.5",
    },
    md: {
      avatar: "w-7 h-7",
      text: "text-xs",
      gap: "gap-2",
    },
    lg: {
      avatar: "w-9 h-9",
      text: "text-sm",
      gap: "gap-2.5",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={`flex items-center ${currentSize.gap} ${currentSize.text} text-muted`}
    >
      <Link
        href={`/${name}`}
        className="hover:opacity-80 transition-opacity shrink-0"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`${currentSize.avatar} rounded-full object-cover border border-border/50`}
          />
        ) : (
          <div
            className={`${currentSize.avatar} rounded-full bg-muted/20 dark:bg-muted/10 border border-border/50`}
          />
        )}
      </Link>

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1 flex-wrap">
          <Link
            href={`/${name}`}
            className="font-bold text-text hover:text-primary-600 transition-colors cursor-pointer"
          >
            {name}
          </Link>
          {(institution || degreeProgram) && (
            <span className="text-muted/60 font-medium italic">
              at {institution || "Unknown Institution"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted/80 font-medium">
          {degreeProgram && (
            <>
              <span>{degreeProgram}</span>
              <span>•</span>
            </>
          )}
          <span>{updatedAt ? `edited ${updatedAt}` : createdAt}</span>
        </div>
      </div>
    </div>
  );
}
