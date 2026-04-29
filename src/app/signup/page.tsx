"use client";

import FullButton from "@/components/inputs/FullButton";
import { TextInputwLabel } from "@/components/inputs/TextInput";

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

    const user_name = formData.get("user_name") as string;
    const email = formData.get("email") as string;
    const institution = formData.get("institution") as string;
    const education_level = formData.get("education_level") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/signup", {
        user_name,
        email,
        password,
        age: null,
        gender: null,
        institution,
        education_level,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-sm py-12">
      <h1 className="text-2xl font-sora font-bold mb-6">Create an account</h1>
      <form
        id="form-container"
        action={handleSignup}
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
            label="Username:"
            name="user_name"
            placeholder="johndoe123"
            type="text"
          />
          <div id="education-field-container" className="flex flex-row gap-3">
            <div className="w-3/5">
              <TextInputwLabel
                label="Institution:"
                name="institution"
                placeholder="UP Cebu"
                type="text"
              />
            </div>
            <div className="w-2/5 flex flex-col gap-1">
              <p className="font-medium text-text">Education Level:</p>
              <div className="group w-full h-fit p-1 border border-border rounded-xl bg-surface/50 transition-all duration-200">
                <select
                  name="education_level"
                  className="w-full bg-transparent outline-none border-none text-text rounded-lg p-2 cursor-pointer"
                >
                  <option value="high_school">High School</option>
                  <option value="bachelor">Bachelor</option>
                  <option value="master">Master</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <TextInputwLabel
            label="Password:"
            name="password"
            placeholder="Enter your password"
            type="password"
          />
          <TextInputwLabel
            label="Confirm Password:"
            name="confirmPassword"
            placeholder="Re-enter your password"
            type="password"
          />
        </div>

        <FullButton
          label={isLoading ? "Creating Account..." : "Create Account"}
          type="submit"
        ></FullButton>
      </form>
      <p className="mt-4 text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
