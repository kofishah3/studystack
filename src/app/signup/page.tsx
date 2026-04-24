"use client";

import FullButton from "@/components/inputs/fullbutton";
import { TextInputwLabel } from "@/components/inputs/textinput";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-sm">
      <h1 className="text-2xl font-sora font-bold mb-6">Create an account</h1>
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
          <div id="name-field-container" className="flex flex-row gap-3">
            <div className="w-3/5">
              <TextInputwLabel
                label="First Name:"
                name="firstName"
                placeholder="Isabella"
                type="text"
              />
            </div>
            <div className="w-2/5">
              <TextInputwLabel
                label="Last Name:"
                name="lastName"
                placeholder="Recilla"
                type="text"
              />
            </div>
          </div>
          <div id="education-field-container" className="flex flex-row gap-3">
            <div className="w-3/5">
              <TextInputwLabel
                label="Institution:"
                name="institution"
                placeholder="UP Cebu"
                type="text"
              />
            </div>
            <div className="w-2/5">
              <TextInputwLabel
                label="Education Level:"
                name="educlevel"
                placeholder="Undergraduate"
                type="text"
              />
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
          label="Create Account"
          onClick={() => router.push("/home")}
        ></FullButton>
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
