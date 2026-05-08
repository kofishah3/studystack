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
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="w-7 h-7 rounded-full object-cover"
                />
            ) : (
                <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700" />
            )}

            <div className="flex items-enter gap-1 flex-wrap">
                <span
                    className="font-medium">
                    {name}
                </span>

                <span>•</span>

                <span>
                    {updatedAt
                        ? `edited ${updatedAt}`
                        : createdAt}
                </span>
            </div>
        </div>
    );
}