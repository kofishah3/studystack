"use client";

import TopNavBar from "@/components/navigation/topnavbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HelpCircle,
  MessageCircle,
  Heart,
  Star,
  Activity,
  UserPlus,
} from "lucide-react";
import ProfileMetricCard from "@/components/profile/ProfileMetricCard";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePostCard from "@/components/profile/ProfilePostCard";
import { Metrics } from "@/lib/queries/users";
import { SkeletonList } from "@/components/ui/SkeletonCard";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subtitle, setSubtitle] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("Tutorials");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    questions: 0,
    answers: 0,
    likes: 0,
    rating: 0,
    engagement: 0,
  });

  const router = useRouter();

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  useEffect(() => {
    if (userProfile) {
      const controller = new AbortController();
      fetchPosts(controller.signal);
      fetchUserMetrics(controller.signal);
      return () => controller.abort();
    }
  }, [activeTab, userProfile]);

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

  const fetchPosts = async (signal?: AbortSignal) => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch(
        `/api/users/${username}/posts?type=${encodeURIComponent(activeTab)}`,
        { signal }
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      const json = await res.json();
      if (json.data) setPosts(json.data);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchUserMetrics = async (signal?: AbortSignal) => {
    setIsLoadingMetrics(true);
    try {
      const res = await fetch(`/api/users/${username}/metrics`, { signal });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const json = await res.json();
      if (json.data) setMetrics(json.data);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch metrics:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
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
      <div
        id="profile-content-container"
        className="flex flex-col px-4 sm:px-8 py-8 gap-10 w-full max-w-5xl mx-auto flex-1"
      >
        <div
          id="profile-header"
          className="flex flex-row items-center justify-between gap-4 sm:gap-6"
        >
          <div
            id="basic-details"
            className="flex flex-row items-center gap-4 sm:gap-5 min-w-0"
          >
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-linear-to-r from-border to-border rounded-full opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative p-0.5 bg-background rounded-full overflow-hidden border border-border">
                <img
                  src={
                    userProfile?.profile_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                  }
                  alt="Profile"
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold font-sora text-text tracking-tight truncate">
                {username}
              </h1>
              <p className="text-muted text-xs sm:text-sm mt-0.5 font-medium wrap-break-word leading-tight">
                {subtitle}
              </p>
            </div>
          </div>

          <div
            id="profile-actions"
            className="flex flex-row items-center gap-2 shrink-0"
          >
            <button
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-primary-500 hover:bg-primary-600 
            rounded-full text-white font-semibold shadow-sm text-xs
            cursor-pointer transition-all duration-200 active:scale-95
            "
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Follow</span>
            </button>
          </div>
        </div>

        <div
          id="profile-metrics"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full"
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
            className="col-span-2 sm:col-span-1"
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
