"use client";

import FullButton from "@/components/inputs/FullButton";
import { TextInputwLabel } from "@/components/inputs/TextInput";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-sm">
      <div
        id="login-form"
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
            <Image
              src="/logos/studystack-logo.png"
              alt="StudyStack Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <h1 className="text-3xl font-sora font-bold text-text mb-2">
                Welcome Back
              </h1>
              <p className="text-muted text-sm">
                Please enter your details to sign in.
              </p>
            </div>
          </div>

          <form
            id="form-container"
            action={handleLogin}
            className="flex flex-col gap-6"
          >
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center animate-shake">
                {error}
              </div>
            )}
            <div id="input-fields" className="flex flex-col gap-4">
              <TextInputwLabel
                label="Email"
                name="email"
                placeholder="name@company.com"
                type="email"
              />
              <TextInputwLabel
                label="Password"
                name="password"
                placeholder="••••••••"
                type="password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-muted select-none cursor-pointer">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-primary-500 hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <FullButton
              label="Sign In"
              type="submit"
              isLoading={isLoading}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted">
                  Or continue with
                </span>
              </div>
            </div>

            <div id="login-social-auth" className="flex flex-col gap-4">
              <GoogleAuthButton id="login-google-button" />
            </div>
          </form>

          <p className="mt-8 text-center text-muted">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-500 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div
        id="rightside-graphic"
        className="hidden lg:block lg:w-1/2 bg-white h-screen"
      ></div>
    </div>
  );
}
