"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TextInputwLabel } from "@/components/inputs/TextInput";
import { SelectInputwLabel } from "@/components/inputs/SelectInput";
import { SearchableSelectwLabel } from "@/components/inputs/SearchableSelect";
import FullButton from "@/components/inputs/FullButton";
import { CEBU_SCHOOLS, DEGREE_PROGRAMS } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    user_name: "",
    institution: "",
    education_level: "bachelor",
    degree_program: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      setFormData((prev) => ({
        ...prev,
        user_name: user.user_name || "",
      }));
    } else {
      router.push("/signup");
    }
  }, [router]);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.user_name) {
      setError("Please pick a username");
      return;
    }
    if (step === 2) {
      if (!formData.institution) {
        setError("Please enter your institution");
        return;
      }
      const isCollege = ["bachelor", "master", "doctorate"].includes(
        formData.education_level,
      );
      if (isCollege && !formData.degree_program) {
        setError("Please enter your degree program");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("/api/auth/onboarding", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const isCollegeLevel = ["bachelor", "master", "doctorate"].includes(
    formData.education_level,
  );

  return (
    <div
      id="onboarding-page"
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6"
    >
      <div
        id="onboarding-card"
        className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-xl p-8 md:p-12 transition-all duration-500"
      >
        <div
          id="onboarding-progress"
          className="w-full h-1.5 bg-border rounded-full mb-10 overflow-hidden"
        >
          <div
            className="h-full bg-primary-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {error && (
          <div
            id="onboarding-error"
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center animate-shake text-sm"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div
            id="step-1"
            className="animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <h2
              id="step-1-title"
              className="text-2xl font-sora font-bold text-text mb-2"
            >
              Welcome!
            </h2>
            <p id="step-1-subtitle" className="text-muted mb-8 text-sm">
              Let's start with how people will see you.
            </p>

            <div className="space-y-6">
              <TextInputwLabel
                id="onboarding-username"
                label="Username"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="johndoe123"
                type="text"
              />
              <p className="text-xs text-muted">
                You can change this later in settings.
              </p>
            </div>

            <div className="mt-10">
              <FullButton
                id="step-1-next"
                label="Continue"
                onClick={handleNext}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div
            id="step-2"
            className="animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <h2
              id="step-2-title"
              className="text-2xl font-sora font-bold text-text mb-2"
            >
              Education
            </h2>
            <p id="step-2-subtitle" className="text-muted mb-8 text-sm">
              Tell us about your studies.
            </p>

            <div className="space-y-6">
              <div
                id="onboarding-level-container"
                className="flex flex-col gap-2"
              >
                <label className="font-medium text-text text-sm">
                  Education Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["high_school", "bachelor", "master", "doctorate"].map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        id={`level-${level}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            education_level: level,
                            // Reset degree program if moving to high school
                            ...(level === "high_school"
                              ? { degree_program: "" }
                              : {}),
                          }))
                        }
                        className={`py-3 px-4 rounded-xl border transition-all duration-200 text-sm ${
                          formData.education_level === level
                            ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                            : "border-border bg-transparent text-text hover:bg-surface hover:border-primary-300"
                        }`}
                      >
                        {level.replace("_", " ").charAt(0).toUpperCase() +
                          level.replace("_", " ").slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <SearchableSelectwLabel
                id="onboarding-institution"
                label="Institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                options={CEBU_SCHOOLS}
                placeholder="University Name"
              />

              {isCollegeLevel && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <SearchableSelectwLabel
                    id="onboarding-degree-program"
                    label="Degree Program"
                    name="degree_program"
                    value={formData.degree_program}
                    onChange={handleChange}
                    options={DEGREE_PROGRAMS}
                    placeholder="BS Computer Science"
                  />
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <FullButton
                label="Back"
                variant="secondary"
                onClick={handleBack}
              />
              <FullButton
                id="step-2-next"
                label="Continue"
                onClick={handleNext}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            id="step-3"
            className="animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <h2
              id="step-3-title"
              className="text-2xl font-sora font-bold text-text mb-2"
            >
              Almost Done!
            </h2>
            <p id="step-3-subtitle" className="text-muted mb-8 text-sm">
              A few more details to personalize your experience.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <TextInputwLabel
                    id="onboarding-age"
                    label="Age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="20"
                    type="number"
                  />
                </div>
                <div className="flex-1">
                  <SelectInputwLabel
                    id="onboarding-gender"
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder="Select..."
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
              </div>

              <div
                id="onboarding-profile-info"
                className="p-4 bg-surface rounded-2xl border border-dashed border-border"
              >
                <p className="text-center text-sm text-slate-500">
                  You can upload a profile picture later in your settings.
                </p>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <FullButton
                label="Back"
                variant="secondary"
                onClick={handleBack}
              />
              <FullButton
                id="onboarding-complete"
                label="Finish Setup"
                isLoading={isLoading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>

      <p id="onboarding-skip" className="mt-8 text-muted text-sm">
        In a hurry? You can complete this later.
        <button
          id="skip-button"
          onClick={() => router.push("/home")}
          className="ml-2 text-primary-500 font-semibold hover:underline"
        >
          Skip for now
        </button>
      </p>
    </div>
  );
}
