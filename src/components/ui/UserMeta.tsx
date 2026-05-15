import Link from "next/link";

type UserMetaProps = {
  name: string;
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
};

export default function UserMeta({
  name,
  createdAt,
  updatedAt,
  avatarUrl,
  size = "md",
}: UserMetaProps) {
  const sizeClasses = {
    sm: {
      avatar: "w-6 h-6",
      text: "text-xs",
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
      className={`flex items-center ${currentSize.gap} ${currentSize.text} text-gray-500`}
    >
      <Link href={`/${name}`} className="hover:opacity-80 transition-opacity shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`${currentSize.avatar} rounded-full object-cover`}
            onError={(e) => {
              // Hide broken image and show the gray fallback instead
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("style");
            }}
          />
        ) : null}
        <div
          className={`${currentSize.avatar} rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400`}
          style={avatarUrl ? { display: "none" } : undefined}
        >
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      </Link>

      <div className="flex items-center gap-1 flex-wrap">
        <Link
          href={`/${name}`}
          className="font-semibold text-text hover:text-primary-500 transition-colors cursor-pointer"
        >
          {name}
        </Link>

        <span>•</span>

        <span>{updatedAt ? `edited ${updatedAt}` : createdAt}</span>
      </div>
    </div>
  );
}
