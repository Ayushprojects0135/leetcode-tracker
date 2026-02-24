"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicProfile() {
  const params = useParams();
  const username = params?.username as string;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!username) return;

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `https://leetcode-api-faisalshohag.vercel.app/${username}`
      );

      if (!res.ok) {
        setStats(null);
        return;
      }

      const data = await res.json();

      setStats({
        easy: data.easySolved,
        medium: data.mediumSolved,
        hard: data.hardSolved,
        total: data.totalSolved,
      });

    } catch (error) {
      console.error(error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, [username]);



  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (!stats)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        LeetCode user not found
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex justify-center py-16 px-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold mb-6">
          {username}'s LeetCode Stats 🚀
        </h1>

        <p className="text-4xl font-semibold mb-8">
          Total Solved: {stats.total}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-green-400 text-sm">Easy</p>
            <p className="text-xl font-semibold mt-1">
              {stats.easy}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-yellow-400 text-sm">Medium</p>
            <p className="text-xl font-semibold mt-1">
              {stats.medium}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">Hard</p>
            <p className="text-xl font-semibold mt-1">
              {stats.hard}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}