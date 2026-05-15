"use client";

import Sidebar from "@/components/navigation/Sidebar";
import TopNavBar from "@/components/navigation/TopNavigationBar";
import { useState } from "react";

export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div
      id="homepage-container"
      className="flex h-screen bg-background flex-col overflow-hidden"
    >
      <TopNavBar />
      <div className="flex flex-row flex-1 w-full overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
          <div className="text-center opacity-0 animate-[fade-in_1s_ease-out_forwards]">
            <h1 className="text-3xl font-sora font-bold text-gray-900 dark:text-white mb-3">
              Welcome to StudyStack
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Your community-driven learning hub. Ask questions, share
              tutorials, and grow together.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
