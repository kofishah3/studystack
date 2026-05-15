"use client";

import { useEffect, useState } from "react";

interface EligibilityState {
  canCreateTutorial: boolean;
  metrics: { rating: number; engagement: number };
  required: { rating: number; engagement: number };
}

export function useEligibility() {
  const [eligibility, setEligibility] = useState<EligibilityState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/user/eligibility", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setEligibility)
      .catch(() => {});
  }, []);

  return eligibility;
}
