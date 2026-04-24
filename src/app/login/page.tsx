"use client";

import FullButton from "@/components/inputs/fullbutton";
import { TextInputwLabel } from "@/components/inputs/textinput";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-sm">
      <h1 className="text-2xl font-sora font-bold mb-6">
        Login to your account
      </h1>
      <div
        id="form-container"
        className="w-full max-w-lg p-8 bg-surface rounded-xl border border-border shadow-sm flex flex-col gap-5"
      >
        <div id="input-fields" className="flex flex-col gap-3">
          <TextInputwLabel
            label="Email:"
            name="email"
            placeholder="sampleemail@domain.com"
            type="email"
          />
          <TextInputwLabel
            label="Password:"
            name="password"
            placeholder="Enter your password"
            type="password"
          />
        </div>

        <FullButton
          label="Log In"
          onClick={() => router.push("/home")}
        ></FullButton>
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
