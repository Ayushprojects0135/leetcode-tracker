"use client";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center py-6">
      <h1 className="text-2xl font-bold">LeetCode Tracker</h1>
      <div className="space-x-4">
        <button className="bg-white text-black px-4 py-2 rounded-lg">
          Login
        </button>
      </div>
    </div>
  );
}