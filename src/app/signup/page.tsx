import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-sm">
      <h1 className="text-2xl font-sora font-bold mb-6">Create an account</h1>
      <div className="w-full max-w-md p-8 bg-background rounded-xl border border-border shadow-sm">
        <p className="text-center text-muted font-inter">
          Signup form placeholder
        </p>
      </div>
      <p className="mt-4 text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
