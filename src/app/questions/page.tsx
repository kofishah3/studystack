"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useState } from "react";
import Sidebar from "@/components/navigation/sidebar";

export default function QuestionsPage() {
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);

  return (
    <div
      id="questions-container"
      className="flex min-h-screen bg-background flex-col"
    >
      <TopNavBar />
      <Sidebar isCollapsed={isSideBarCollapsed} />
    </div>
  );
}
