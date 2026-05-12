import Link from "next/link";

type UserMetaProps = {
  name: string;
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
};

export default function UserMeta({
  name,
  createdAt,
  updatedAt,
  avatarUrl,
}: UserMetaProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Link href={`/${name}`} className="hover:opacity-80 transition-opacity">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700" />
        )}
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