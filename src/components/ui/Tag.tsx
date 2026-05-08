export default function SubjectTag({ label }: { label: string }) {
    return (
        <span  className="text-xs px-2 py-1 text-gray-500 border-1 border-gray-400 rounded-md">
            {label}
        </span>
    );
}