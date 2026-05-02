"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Edit2 } from "lucide-react";
import ProfileMetricCard from "@/components/profile/ProfileMetricCard";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePostCard from "@/components/profile/ProfilePostCard";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("Loading...");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tutorials");
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.user_name || "User");
        const edu = user.education_level || "Undergraduate";
        const eduFormatted =
          edu.charAt(0).toUpperCase() + edu.slice(1).replace("_", " ");
        const inst = user.institution || "University";
        setSubtitle(`${eduFormatted} @ ${inst}`);
      } catch (e) {
        console.error(e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const tabs = ["Tutorials", "Questions asked", "Answers given"];

  return (
    <div className="flex min-h-[calc(100vh-1.5rem)] bg-background flex-col m-3 rounded-xl border border-border overflow-hidden relative">
      <TopNavBar />
      <div
        id="profile-content-container"
        className="flex flex-col p-8 gap-8 w-full mx-auto flex-1 bg-surface"
      >
        <div
          id="profile-header"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div id="basic-details" className="flex flex-row items-center gap-6">
            <div className="p-1 bg-surface border border-border rounded-full shadow-sm shrink-0">
              <img
                src="https://static.wikia.nocookie.net/chiikawa/images/a/a0/Momonga.png/revision/latest?cb=20240921205329"
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold font-sora text-text">
                {userName}
              </h1>
              <p className="text-muted text-sm sm:text-base mt-1">{subtitle}</p>
            </div>
          </div>

          <div
            id="profile-actions"
            className="flex flex-row items-center gap-2"
          >
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-surface-hover 
            border border-border rounded-xl text-text font-medium shadow-sm text-sm
            cursor-pointer hover:bg-muted/5 transition-all duration-200
            "
            >
              <Edit2 size={16} />
              <span>Edit profile</span>
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2.5 border border-border rounded-xl text-text hover:bg-surface-hover 
                  shadow-sm flex items-center justify-center 
                  cursor-pointer hover:bg-muted/5 transition-all duration-200
                  ${isSettingsOpen ? "bg-surface-hover" : "bg-surface"}`}
              >
                <Settings size={20} />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg z-10 flex flex-col p-1 duration-200">
                  <div className="px-3 py-3 flex items-center justify-between text-sm font-medium text-text border-b border-border">
                    <span>Dark Mode</span>
                    <div className="scale-90 origin-right">
                      <ThemeToggle className="shadow-none border-none bg-background hover:bg-surface-hover" />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-3 w-full flex items-center gap-2 text-left text-sm font-medium 
                    text-red-500 hover:bg-red-100/50 rounded-lg mt-1 transition-colors
                    cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div id="profile-metrics" className="flex flex-row flex-wrap gap-4 w-full">
          <ProfileMetricCard value="N/A" label="Questions" />
          <ProfileMetricCard value="N/A" label="Answers" />
          <ProfileMetricCard value="N/A" label="Likes Given" />
          <ProfileMetricCard value="N/A" label="Rating" variant="success" />
          <ProfileMetricCard value="N/A" label="Engagement" variant="warning" />
        </div>

        <div id="profile-content" className="flex flex-col gap-6 w-full">
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <div className="flex flex-col gap-4">
             {/* Mock Tutorials - as per image */}
             {activeTab === "Tutorials" && (
              <>
                 <ProfilePostCard 
                   title="N/A"
                   type="Tutorial"
                   timeAgo="N/A"
                   upvotes="N/A"
                   comments="N/A"
                 />
                 <ProfilePostCard 
                   title="N/A"
                   type="Tutorial"
                   timeAgo="N/A"
                   upvotes="N/A"
                   comments="N/A"
                 />
              </>
             )}
             
             {activeTab !== "Tutorials" && (
                <div className="text-muted text-sm py-4 text-center">
                  No {activeTab.toLowerCase()} yet.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
