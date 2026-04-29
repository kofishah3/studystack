"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("Loading...");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  return (
    <div className="flex min-h-[calc(100vh-1.5rem)] bg-background flex-col m-3 rounded-xl border border-border overflow-hidden relative">
      <div className="flex flex-col p-8 gap-8 w-full max-w-5xl mx-auto flex-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-6">
            <div className="p-1 bg-surface border border-border rounded-full shadow-sm">
              <img
                src="https://static.wikia.nocookie.net/chiikawa/images/a/a0/Momonga.png/revision/latest?cb=20240921205329"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold font-sora text-text">
                {userName}
              </h1>
              <p className="text-muted text-md sm:text-lg">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-text font-medium transition-colors shadow-sm">
              <Edit2 size={16} />
              <span>Edit profile</span>
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2.5 border border-border rounded-xl text-text hover:bg-surface-hover transition-colors shadow-sm flex items-center justify-center ${isSettingsOpen ? "bg-surface-hover" : "bg-surface"}`}
              >
                <Settings size={20} />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg z-10 flex flex-col p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-3 flex items-center justify-between text-sm font-medium text-text border-b border-border">
                    <span>Dark Mode</span>
                    <div className="scale-90 origin-right">
                      <ThemeToggle className="shadow-none border-none bg-background hover:bg-surface-hover" />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-3 w-full flex items-center gap-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg mt-1 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
