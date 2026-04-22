import TextInput from "@/components/inputs/TextInput";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-sm">
      <h1 className="text-2xl font-sora font-bold mb-6">
        Login to your account
      </h1>
      <div
        id="form-container"
        className="w-full max-w-md p-8 bg-background rounded-xl border border-border shadow-sm"
      >
        <div id="input-fields" className="flex flex-col gap-3">
          <div id="email-input" className="flex flex-col gap-1">
            <p>Email:</p>
            <TextInput
              name="sample"
              placeholder="sampleemail@domain.com"
              type="email"
            ></TextInput>
          </div>
          <div id="email-input" className="flex flex-col gap-1">
            <p>Password:</p>
            <TextInput
              name="sample"
              placeholder="Enter your password"
              type="password"
            ></TextInput>
          </div>
        </div>
      </div>
      <p className="mt-4 text-muted">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
