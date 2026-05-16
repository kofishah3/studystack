"use client";

import TopNavBar from "@/components/navigation/TopNavigationBar";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Edit2 } from "lucide-react";
import ProfileView from "@/components/profile/ProfileView";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("Loading...");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        handleProfileUpdate(user);
      } catch (e) {
        console.error("Failed to parse user", e);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUserProfile(updatedUser);
    setUserName(updatedUser.user_name || "User");
    const edu = updatedUser.education_level || "Undergraduate";
    const eduFormatted =
      edu.charAt(0).toUpperCase() + edu.slice(1).replace("_", " ");
    const inst = updatedUser.institution || "University";
    const program = updatedUser.degree_program;

    if (program) {
      setSubtitle(`${program} @ ${inst} (${eduFormatted})`);
    } else {
      setSubtitle(`${eduFormatted} @ ${inst}`);
    }
  };

  const actions = (
    <>
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-surface hover:bg-muted/5 
        border border-border rounded-full text-text font-semibold shadow-sm text-xs
        cursor-pointer transition-all duration-200 active:scale-95"
      >
        <Edit2 size={14} />
        <span className="hidden sm:inline">Edit profile</span>
      </button>

      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 border border-border rounded-full text-text hover:bg-muted/5 
            shadow-sm flex items-center justify-center 
            cursor-pointer transition-all duration-200 active:scale-95
            ${isSettingsOpen ? "bg-surface-hover" : "bg-surface"}`}
        >
          <Settings size={18} />
        </button>

        {isSettingsOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-xl z-20 flex flex-col p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-text/80 border-b border-border/50">
              <span>Appearance</span>
              <div className="scale-75 origin-right">
                <ThemeToggle className="shadow-none border-none bg-background hover:bg-surface-hover" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2.5 w-full flex items-center gap-2 text-left text-xs font-semibold 
              text-red-500 hover:bg-red-500/5 rounded-xl mt-1 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background flex-col relative">
      <TopNavBar />
      <ProfileView
        username={userName}
        userProfile={userProfile}
        subtitle={subtitle}
        headerActions={actions}
        footer={
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={userProfile}
            onUpdate={handleProfileUpdate}
          />
        }
      />
    </div>
  );
}
