export default function HomePage() {
  return (
    <main className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
      <div className="text-center opacity-0 animate-[fade-in_1s_ease-out_forwards]">
        <h1 className="text-3xl font-sora font-bold text-gray-900 dark:text-white mb-3">
          Welcome to StudyStack
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Your community-driven learning hub. Ask questions, share tutorials, and
          grow together.
        </p>
      </div>
    </main>
  );
}
