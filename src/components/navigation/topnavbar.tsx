"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Home, BookOpen, MessageCircleQuestionMark, User } from "lucide-react";
import NavBarButton from "./NavBarButton";

function formatEducationLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1).replace("_", " ");
}

interface TopNavBarProps {}

export default function TopNavBar({}: TopNavBarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Loading...");
  const [education, setEducation] = useState("Loading...");
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          setUserName(user.user_name || "User");
          const edu = user.education_level || "Undergraduate";
          setEducation(formatEducationLevel(edu));
          setProfileUrl(
            user.profile_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_name}`,
          );
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    } else {
      setUserName("Guest");
      setEducation("Unknown");
    }
  }, []);

  const isActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <div id="navbar-container" className="fixed bottom-0 sm:sticky sm:top-0 z-50 w-full">
      <div
        id="navbar-content-container"
        className="w-full bg-surface px-6 py-2 sm:py-5 border-t sm:border-t-0 sm:border-b border-border/50 
      justify-between items-center flex flex-row relative shadow-[0_-1px_3px_rgba(0,0,0,0.05)] sm:shadow-sm"
      >
        <div id="logo-container" className="hidden sm:flex">
          <span
            id="temp-logo"
            className="text-xl font-bold font-sora tracking-tight"
          >
            StudyStack
          </span>
        </div>

        <div
          id="navbuttons-container"
          className="flex flex-row gap-2 w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2 items-center justify-around sm:justify-center"
        >
          <Link href="/home" id="link-home">
            <NavBarButton
              label="Home"
              icon={Home}
              isSelected={isActive("/home")}
            />
          </Link>
          <Link href="/tutorials" id="link-tutorials">
            <NavBarButton
              label="Tutorials"
              icon={BookOpen}
              isSelected={isActive("/tutorials")}
            />
          </Link>
          <Link href="/questions" id="link-questions">
            <NavBarButton
              label="Questions"
              icon={MessageCircleQuestionMark}
              isSelected={isActive("/questions")}
            />
          </Link>
          <Link href="/profile" id="link-profile-mobile" className="sm:hidden">
            <NavBarButton
              label="Profile"
              icon={User}
              isSelected={isActive("/profile")}
            />
          </Link>
        </div>

        <div id="rightmost-container" className="hidden sm:flex flex-row gap-1">
          <Link
            id="profile-link-desktop"
            href="/profile"
            className="flex flex-row gap-3 items-center group"
          >
            <div
              id="profile-details-container"
              className="flex-col font-inter justify-center hidden sm:flex text-right"
            >
              <p 
                id="profile-username"
                className="text-sm text-text font-bold leading-tight group-hover:text-primary-500 transition-colors duration-200"
              >
                {userName}
              </p>
              <p 
                id="profile-education"
                className="text-xs font-bold text-muted group-hover:text-primary-500/70 transition-colors duration-200"
              >
                {education}
              </p>
            </div>
            <div id="profile-image-container" className="items-center flex relative">
              <div
                id="profile-image-hover-ring"
                className="absolute -inset-0.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-20 
              transition-opacity duration-300"
              ></div>
              {profileUrl && (
                <img
                  id="profile-image"
                  src={profileUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border border-border group-hover:border-primary-500/50
                  transition-colors duration-300 relative object-cover shrink-0"
                />
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
