import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const members = [
    "Limpag, Max Lennon",
    "Sandro, John Carlo",
    "Malig, Selena Therese",
    "Recilla, Isabella Nicole",
    "Bautista, Ishah Nicholei",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-8">
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <Image
              src="/logos/studystack-logo.png"
              alt="StudyStack Logo"
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sora font-bold text-text tracking-tight">
            StudyStack
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-xs sm:max-w-md">
            The community-driven learning platform for students.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center px-4">
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center whitespace-nowrap px-8 py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all text-center min-h-[52px]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 flex items-center justify-center whitespace-nowrap px-8 py-3.5 bg-transparent border-2 border-border text-text rounded-xl font-semibold hover:bg-surface transition-all text-center min-h-[52px]"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-muted">Developed by</h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {members.map((member) => (
              <span key={member} className="text-text font-medium">
                {member}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
