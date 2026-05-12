"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import {
  Settings,
  LogOut,
  Edit2,
  HelpCircle,
  MessageCircle,
  Heart,
  Star,
  Activity,
} from "lucide-react";
import ProfileMetricCard from "@/components/profile/ProfileMetricCard";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePostCard from "@/components/profile/ProfilePostCard";
import { Metrics } from "@/lib/queries/users";
import { SkeletonList } from "@/components/ui/SkeletonCard";

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
    <div className="flex min-h-screen bg-background flex-col relative">
      <TopNavBar />
      <div
        id="profile-content-container"
        className="flex flex-col px-4 sm:px-8 py-8 gap-10 w-full max-w-5xl mx-auto flex-1"
      >
        <div
          id="profile-header"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div id="basic-details" className="flex flex-row items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-border to-border rounded-full opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative p-0.5 bg-background rounded-full shrink-0 overflow-hidden border border-border">
                <img
                  src="https://static.wikia.nocookie.net/chiikawa/images/a/a0/Momonga.png/revision/latest?cb=20240921205329"
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold font-sora text-text tracking-tight">
                {userName}
              </h1>
              <p className="text-muted text-xs sm:text-sm mt-0.5 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <div
            id="profile-actions"
            className="flex flex-row items-center gap-2"
          >
            <button
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-muted/5 
            border border-border rounded-full text-text font-semibold shadow-sm text-xs
            cursor-pointer transition-all duration-200 active:scale-95
            "
            >
              <Edit2 size={14} />
              <span>Edit profile</span>
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
                    text-red-500 hover:bg-red-500/5 rounded-xl mt-1 transition-colors
                    cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          id="profile-metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full"
        >
          <ProfileMetricCard
            value={metrics.questions}
            label="Questions"
            icon={HelpCircle}
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.answers}
            label="Answers"
            icon={MessageCircle}
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.likes}
            label="Likes"
            icon={Heart}
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.rating}
            label="Rating"
            icon={Star}
            variant="success"
            isLoading={isLoadingMetrics}
          />
          <ProfileMetricCard
            value={metrics.engagement}
            label="Engagement"
            icon={Activity}
            variant="warning"
            isLoading={isLoadingMetrics}
          />
        </div>

        <div id="profile-content" className="flex flex-col gap-8 w-full mt-2">
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="flex flex-col gap-4">
            {isLoadingPosts ? (
              <SkeletonList count={3} />
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {posts.map((post) => (
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl bg-surface/50">
                <p className="text-muted text-xs font-medium text-center max-w-[200px]">
                  No {activeTab.toLowerCase()} to show right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
