"use client";

import FullButton from "@/components/inputs/FullButton";
import { TextInputwLabel } from "@/components/inputs/TextInput";

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
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-sm">
      <h1 className="text-2xl font-sora font-bold mb-6">
        Login to your account
      </h1>
      <form
        id="form-container"
        action={handleLogin}
        className="w-full max-w-lg p-8 bg-surface rounded-xl border border-border shadow-sm flex flex-col gap-5"
      >
        {error && (
          <div className="p-3 bg-red-100 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}
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
          label={isLoading ? "Logging in..." : "Log In"}
          type="submit"
        ></FullButton>
      </form>
      <p className="mt-4 text-muted">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
