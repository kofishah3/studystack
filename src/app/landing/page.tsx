import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text">
      <h1 className="text-4xl font-sora font-bold mb-4">Studystack</h1>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
