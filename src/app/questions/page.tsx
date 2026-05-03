"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useState } from "react";

export default function QuestionsPage() {
  return (
    <div
      id="questionspage-container"
      className="flex h-[calc(100vh-1.5rem)] bg-background flex-col m-3 rounded-xl border border-border overflow-hidden"
    >
      <TopNavBar />
    </div>
  );
}
