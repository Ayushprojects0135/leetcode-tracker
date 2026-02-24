"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState("");

  // 🔥 AUTO SYNC FUNCTION
  const syncLeetCode = async (token: string) => {
    try {
      await fetch("http://localhost:5000/api/users/sync", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Auto sync failed:", error);
    }
  };

  // 🔥 LOAD DATA ON DASHBOARD OPEN
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1️⃣ Sync first
        await syncLeetCode(token);

        // 2️⃣ Fetch updated user
        const res = await fetch(
          "http://localhost:5000/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setUser(data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateCount = async (difficulty: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/users/increment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ difficulty }),
        }
      );

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const updateGoal = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/users/goal",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dailyGoal: Number(newGoal),
          }),
        }
      );

      const data = await res.json();
      setUser(data);
      setNewGoal("");
    } catch (error) {
      console.error("Goal update failed:", error);
    }
  };

  if (loading) {
    return <div className="mt-10 px-6">Loading...</div>;
  }

  // 📅 WEEKLY DATA
  const getLast7DaysData = () => {
    if (!user?.solveHistory) return [];

    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const entry = user.solveHistory.find(
        (item: any) =>
          new Date(item.date).toDateString() === date.toDateString()
      );

      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        solved: entry ? entry.count : 0,
      });
    }

    return last7Days;
  };

  const weeklyData = getLast7DaysData();

  return (
    <div className="mt-10 px-6">
      <h1 className="text-4xl font-bold mb-10">Dashboard 🚀</h1>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT CARD */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg space-y-6">

            <p className="text-lg">
              Welcome, <span className="font-semibold">{user.username}</span>
            </p>

            <div className="flex justify-between">
              <span>Easy: {user.easy}</span>
              <button onClick={() => updateCount("easy")} className="bg-green-600 px-3 py-1 rounded">+1</button>
            </div>

            <div className="flex justify-between">
              <span>Medium: {user.medium}</span>
              <button onClick={() => updateCount("medium")} className="bg-yellow-600 px-3 py-1 rounded">+1</button>
            </div>

            <div className="flex justify-between">
              <span>Hard: {user.hard}</span>
              <button onClick={() => updateCount("hard")} className="bg-red-600 px-3 py-1 rounded">+1</button>
            </div>

            <p>Total Solved: {user.totalSolved}</p>

            <div>
              <p>🔥 Current Streak: {user.currentStreak}</p>
              <p>🏆 Longest Streak: {user.longestStreak}</p>
            </div>

            <div>
              <p>🎯 Daily Goal: {user.dailyGoal}</p>
              <p>📈 Today Solved: {user.todaySolved}</p>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Set New Goal"
                className="bg-gray-800 px-2 py-1 rounded"
              />
              <button onClick={updateGoal} className="bg-blue-600 px-3 py-1 rounded">
                Save
              </button>
            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Problem Distribution</h2>

            <PieChart width={350} height={300}>
              <Pie
                data={[
                  { name: "Easy", value: user.easy },
                  { name: "Medium", value: user.medium },
                  { name: "Hard", value: user.hard },
                ]}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#eab308" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>

            <h3 className="mt-8 text-lg font-semibold">📅 Weekly Progress</h3>

            <LineChart width={350} height={250} data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Line type="monotone" dataKey="solved" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>

          </div>
        </div>
      )}
    </div>
  );
}