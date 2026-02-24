export default function Home() {
  return (
    <main className="relative">

      {/* Gradient Glow Background */}
      <div className="absolute inset-0 -z-10 .bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 blur-3xl" />

      {/* Hero Section */}
      <section className="text-center py-32">
        <h1 className="text-6xl md:text-7xl font-bold leading-tight">
          Track Your{" "}
          <span className="text-blue-500">LeetCode</span> Progress
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Analyze your problem-solving journey, visualize growth,
          track streaks, and identify weaknesses — all in one powerful dashboard.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <button className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl text-lg font-medium">
            Get Started
          </button>

          <button className="border border-gray-700 hover:border-gray-500 transition px-6 py-3 rounded-xl text-lg font-medium">
            View Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold mb-3">📊 Analytics</h3>
            <p className="text-gray-400">
              Visualize your solved problems with clean charts and
              difficulty breakdown.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold mb-3">🔥 Streak Tracking</h3>
            <p className="text-gray-400">
              Maintain daily consistency with streaks and heatmaps.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-blue-500 transition">
            <h3 className="text-xl font-semibold mb-3">🧠 Weakness Detection</h3>
            <p className="text-gray-400">
              Identify weak topics and focus your preparation smartly.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}