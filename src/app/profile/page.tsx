"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Edit2 } from "lucide-react";
import ProfileMetricCard from "@/components/profile/ProfileMetricCard";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePostCard from "@/components/profile/ProfilePostCard";
import { Metrics } from "@/lib/queries/users";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("Loading...");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tutorials");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    questions: 0,
    answers: 0,
    likes: 0,
    rating: 0,
    engagement: 0,
  });

  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    fetchUserMetrics();
  }, [activeTab]);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingPosts(true);
    try {
      const res = await fetch(
        `/api/user/posts?type=${encodeURIComponent(activeTab)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      if (json.data) {
        setPosts(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchUserMetrics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingMetrics(true);
    try {
      const res = await fetch(
        `/api/user/metrics?type=${encodeURIComponent(activeTab)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      if (json.data) {
        setMetrics(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
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

        setMetrics({
          questions: user.questions_count || 0,
          answers: user.answers_count || 0,
          likes: user.likes_count || 0,
          rating: user.rating || 0,
          engagement: user.engagement_score || 0,
        });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

        <div
          id="profile-metrics"
          className="flex flex-row flex-wrap gap-4 w-full"
        >
          <ProfileMetricCard
            value={metrics.questions}
            label="Questions"
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.answers}
            label="Answers"
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.likes}
            label="Likes Given"
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.rating}
            label="Rating"
            variant="success"
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.engagement}
            label="Engagement"
            variant="warning"
            isLoading={isLoadingMetrics}
          />
        </div>

        <div id="profile-content" className="flex flex-col gap-6 w-full">
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="flex flex-col gap-4">
            {isLoadingPosts ? (
              <div className="text-muted text-sm py-8 text-center animate-pulse">
                Loading your {activeTab.toLowerCase()}...
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <ProfilePostCard
                  key={post.tutorial_id || post.question_id || post.answer_id}
                  title={
                    post.title ||
                    post.content ||
                    `Answered: ${post.question_content}`
                  }
                  type={
                    activeTab === "Tutorials"
                      ? "Tutorial"
                      : activeTab === "Questions asked"
                        ? "Question"
                        : "Answer"
                  }
                  timeAgo={formatTime(post.created_at)}
                  upvotes={post.demand_score || 0}
                  comments={post.comment_count || 0}
                />
              ))
            ) : (
              <div className="text-muted text-sm py-8 text-center border border-dashed border-border rounded-xl bg-surface-hover/20">
                No {activeTab.toLowerCase()} yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
