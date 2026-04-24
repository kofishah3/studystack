"use client";

import Sidebar from "@/components/navigation/sidebar";
import TopNavBar from "@/components/navigation/topnavbar";
import { useState } from "react";

export default function HomePage() {
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);
  return (
    <div
      id="homepage-container"
      className="flex h-[calc(100vh-1.5rem)] bg-background flex-col m-3 rounded-xl border border-border overflow-hidden"
    >
      <TopNavBar />
      <Sidebar isCollapsed={isSideBarCollapsed} />
    </div>
  );
}
