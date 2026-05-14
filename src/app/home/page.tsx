"use client";

import Sidebar from "@/components/navigation/SideBar";
import TopNavBar from "@/components/navigation/TopNavBar";
import { useState } from "react";

export default function HomePage() {
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState(false);
  return (
    <div
      id="homepage-container"
      className="flex min-h-screen bg-background flex-col "
    >
      <TopNavBar />
      <Sidebar isCollapsed={isSideBarCollapsed} />
    </div>
  );
}
