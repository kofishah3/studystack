"use client";

import Sidebar from "@/components/navigation/sidebar";
import TopNavBar from "@/components/navigation/topnavbar";
import { useState } from "react";

export default function HomePage() {
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);
  return (
    <div
      id="homepage-container"
      className="flex min-h-screen bg-background flex-col"
    >
      <TopNavBar />
      <Sidebar isCollapsed={isSideBarCollapsed} />
    </div>
  );
}
