"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Award, User as UserIcon } from "lucide-react";
import type { User } from "@/types/database";

type LeaderboardUser = User & { engagement: number };

function LeaderboardRow({
  user,
  rank,
}: {
  user: LeaderboardUser;
  rank: number;
}) {
  return (
    <Link
      href={`/${user.user_name}`}
      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold w-4 text-center ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "text-gray-500"}`}
        >
          {rank}
        </span>

        {user.profile_url ? (
          <img
            src={user.profile_url}
            alt={user.user_name}
            className="w-6 h-6 rounded-full object-cover border border-border group-hover:border-primary-400 transition-colors"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-border group-hover:border-primary-400 transition-colors">
            <UserIcon size={12} className="text-gray-500" />
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-xs font-medium text-text group-hover:text-primary-500 transition-colors truncate max-w-[100px]">
            {user.user_name}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <TrendingUp size={10} className="text-primary-500" />
            <span>{user.engagement} acts</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SidebarLeaderboard() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const { data } = await res.json();
          setTopUsers(data);
        }
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div
      id="leaderboard-widget"
      className="w-full flex flex-col gap-1.5 bg-surface p-3 rounded-xl border border-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-text flex items-center gap-1.5">
          <Award size={14} className="text-primary-500" />
          Top Contributors
        </h3>
        <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
          This Week
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {loading ? (
          <span className="text-xs text-gray-400 text-center py-2">
            Loading...
          </span>
        ) : topUsers.length > 0 ? (
          topUsers.map((user, index) => (
            <LeaderboardRow key={user.user_id} user={user} rank={index + 1} />
          ))
        ) : (
          <span className="text-xs text-gray-400 text-center py-2">
            No activity yet.
          </span>
        )}
      </div>
    </div>
  );
}
