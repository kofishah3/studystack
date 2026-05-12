import { MoreHorizontal } from "lucide-react";

export default function ActionMenu() {
    return (
        <button className="p-1 rounded hover:bg-gray-200 dark:">
            <MoreHorizontal size={18} />
        </button>
    );
}