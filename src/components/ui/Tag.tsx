export default function SubjectTag({ label }: { label: string }) {
  return (
    <span
      className="text-xs font-regular px-2.5 py-0.5 
            bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 
            border border-gray-200 dark:border-gray-700 rounded-full transition-colors
            hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {label}
    </span>
  );
}
