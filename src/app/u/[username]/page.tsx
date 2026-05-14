"use client";

import TopNavBar from "@/components/navigation/TopNavBar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import ProfileView from "@/components/profile/ProfileView";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subtitle, setSubtitle] = useState("Loading...");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`/api/users/${username}/profile`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push("/404");
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const json = await res.json();
      if (json.data) {
        setUserProfile(json.data);
        const user = json.data;
        const edu = user.education_level || "Undergraduate";
        const eduFormatted =
          edu.charAt(0).toUpperCase() + edu.slice(1).replace("_", " ");
        const inst = user.institution || "University";
        setSubtitle(`${eduFormatted} @ ${inst}`);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const followAction = (
    <button
      className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-primary-500 hover:bg-primary-600 
    rounded-full text-white font-semibold shadow-sm text-xs
    cursor-pointer transition-all duration-200 active:scale-95
    "
    >
      <UserPlus size={14} />
      <span className="hidden sm:inline">Follow</span>
    </button>
  );

  if (isLoadingProfile && !userProfile) {
    return (
      <div className="flex min-h-screen bg-background flex-col">
        <TopNavBar />
        <div className="flex flex-col px-4 sm:px-8 py-8 gap-10 w-full max-w-5xl mx-auto flex-1 items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-surface border border-border rounded-full"></div>
            <div className="h-6 w-32 bg-surface border border-border rounded-lg"></div>
            <div className="h-4 w-48 bg-surface border border-border rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col relative">
      <TopNavBar />
      <ProfileView
        username={username as string}
        userProfile={userProfile}
        subtitle={subtitle}
        headerActions={followAction}
      />
    </div>
  );
}
