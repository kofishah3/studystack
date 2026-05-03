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

  return (
    <div
      id="topnavbar-container"
      className="w-full bg-surface rounded-tl-xl px-8 py-3 border-b border-border 
      justify-between items-center flex flex-row relative"
    >
      <div id="logo-container">
        <span
          id="temp-logo"
          className="text-2xl font-bold font-sora hidden sm:flex"
        >
          StudyStack
        </span>
      </div>

      <div
        id="navbuttons-container"
        className="flex flex-row gap-3 absolute left-1/2 -translate-x-1/2"
      >
        <Link href="/home">
          <TextButton 
            label="Home" 
            {...defaultTextButtonConfig} 
            isSelected={pathname === "/home"} 
          />
        </Link>
        <Link href="/tutorials">
          <TextButton 
            label="Tutorials" 
            {...defaultTextButtonConfig} 
            isSelected={pathname === "/tutorials"} 
          />
        </Link>
        <Link href="/questions">
          <TextButton 
            label="Questions" 
            {...defaultTextButtonConfig} 
            isSelected={pathname === "/questions"} 
          />
        </Link>
      </div>

      <div id="rightmost-container" className="flex flex-row gap-1 cursor-pointer">
        <Link href="/profile" className="flex flex-row gap-1 items-center">
          <div id="profile-container" className="items-center flex">
            <img
              src={
                "https://static.wikia.nocookie.net/chiikawa/images/a/a0/Momonga.png/revision/latest?cb=20240921205329"
              }
              alt="temporary profile picture"
              className="w-13 h-13 rounded-full border-2 border-border"
            />
          </div>
          <div
            id="profile-details-container"
            className="flex-col font-inter p-2 max-w-30 justify-center hidden sm:flex"
          >
            <p className="text-md text-text font-medium overflow-hidden leading-tight">
              {userName}
            </p>
            <p className="text-sm text-muted -mt-1 overflow-hidden ">
              {education}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

