import Link from "next/link";
import TextButton from "../inputs/textbutton";

interface TopNavBarProps {}

export default function TopNavBar({}: TopNavBarProps) {
  const tempUserName = "Momonga";
  const tempEducation = "Undergraduate";

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
        <TextButton label="Home" {...defaultTextButtonConfig} />
        <TextButton label="Tutorials" {...defaultTextButtonConfig} />
        <TextButton label="Questions" {...defaultTextButtonConfig} />
      </div>

      <div id="rightmost-container" className="flex flex-row gap-1">
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
            {tempUserName}
          </p>
          <p className="text-sm text-muted -mt-1 overflow-hidden ">
            {tempEducation}
          </p>
        </div>
      </div>
    </div>
  );
}
