"use client";

import Link from "next/link";
import TextButton from "../inputs/textbutton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function formatEducationLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1).replace("_", " ");
}

interface TopNavBarProps {}

export default function TopNavBar({}: TopNavBarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Loading...");
  const [education, setEducation] = useState("Loading...");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          setUserName(user.user_name || "User");
          const edu = user.education_level || "Undergraduate";
          setEducation(formatEducationLevel(edu));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    } else {
      setUserName("Guest");
      setEducation("Unknown");
    }
  }, []);

  const defaultTextButtonConfig = {
    textColor: "text",
    selectedColor: "primary-500",
    hoverColor: "primary-500",
  };

  const isActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <div
      id="topnavbar-container"
      className="w-full bg-surface px-6 py-2.5 border-b border-border/50 
      justify-between items-center flex flex-row relative z-50 shadow-sm"
    >
      <div id="logo-container">
        <span
          id="temp-logo"
          className="text-xl font-bold font-sora hidden sm:flex tracking-tight"
        >
          StudyStack
        </span>
      </div>

      <div
        id="navbuttons-container"
        className="flex flex-row gap-1 absolute left-1/2 -translate-x-1/2"
      >
        <Link href="/home">
          <TextButton
            label="Home"
            {...defaultTextButtonConfig}
            isSelected={isActive("/home")}
          />
        </Link>
        <Link href="/tutorials">
          <TextButton
            label="Tutorials"
            {...defaultTextButtonConfig}
            isSelected={isActive("/tutorials")}
          />
        </Link>
        <Link href="/questions">
          <TextButton
            label="Questions"
            {...defaultTextButtonConfig}
            isSelected={isActive("/questions")}
          />
        </Link>
      </div>

      <div
        id="rightmost-container"
        className="flex flex-row gap-1"
      >
        <Link href="/profile" className="flex flex-row gap-3 items-center group">
          <div
            id="profile-details-container"
            className="flex-col font-inter justify-center hidden sm:flex text-right"
          >
            <p className="text-sm text-text font-bold leading-tight group-hover:text-primary-500 transition-colors duration-200">
              {userName}
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider group-hover:text-primary-500/70 transition-colors duration-200">
              {education}
            </p>
          </div>
          <div id="profile-container" className="items-center flex relative">
            <div className="absolute -inset-0.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <img
              src={
                "https://static.wikia.nocookie.net/chiikawa/images/a/a0/Momonga.png/revision/latest?cb=20240921205329"
              }
              alt="Profile"
              className="w-9 h-9 rounded-full border border-border group-hover:border-primary-500/50 transition-colors duration-300 relative"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
