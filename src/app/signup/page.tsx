"use client";

import FullButton from "@/components/inputs/FullButton";
import { TextInputwLabel } from "@/components/inputs/TextInput";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/signup", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("studystack:auth-token"));
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-sm">
      <div id="signup-page-layout" className="flex w-full min-h-screen">
        <div
          id="signup-form-container"
          className="w-full flex flex-col items-center justify-center p-8 lg:p-16 overflow-y-auto"
        >
          <div id="signup-content-wrapper" className="w-full max-w-md my-auto">
            <div
              id="signup-header"
              className="mb-10 text-center flex flex-col items-center gap-4"
            >
              <Image
                src="/logos/studystack-logo.png"
                alt="StudyStack Logo"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <h1
                  id="signup-title"
                  className="text-3xl font-sora font-bold text-text mb-2"
                >
                  Create Account
                </h1>
                <p id="signup-subtitle" className="text-muted text-sm">
                  Join your very own learning community!
                </p>
              </div>
            </div>

            <form
              id="signup-form-element"
              action={handleSignup}
              className="flex flex-col gap-5"
            >
              {error && (
                <div
                  id="signup-error-message"
                  className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center animate-shake"
                >
                  {error}
                </div>
              )}

              <div id="signup-input-fields" className="flex flex-col gap-4">
                <TextInputwLabel
                  id="signup-email-input"
                  label="Email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                />

                <TextInputwLabel
                  id="signup-password-input"
                  label="Password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                />

                <TextInputwLabel
                  id="signup-confirm-password-input"
                  label="Confirm Password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <FullButton
                id="signup-submit-button"
                label="Create Account"
                type="submit"
                isLoading={isLoading}
              />

              <div id="signup-divider" className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
              </div>
            </form>

            <p id="signup-footer" className="mt-8 text-center text-muted">
              Already have an account?{" "}
              <Link
                id="signup-login-link"
                href="/login"
                className="text-primary-500 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
