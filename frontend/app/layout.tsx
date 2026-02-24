import "./globals.css";
import Navbar from "../components/Navbar";
import type { ReactNode } from "react";

export const metadata = {
  title: "LeetCode Tracker",
  description: "Track and analyze your LeetCode progress",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}