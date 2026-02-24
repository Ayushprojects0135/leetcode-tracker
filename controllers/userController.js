const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.incrementSolved = async (req, res) => {
  try {
    const { difficulty } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Increment difficulty
    if (difficulty === "easy") user.easy += 1;
    if (difficulty === "medium") user.medium += 1;
    if (difficulty === "hard") user.hard += 1;

    const today = new Date();

    // =========================
    // DAILY GOAL LOGIC
    // =========================
    if (!user.lastActiveDate) {
      user.todaySolved = 1;
    } else {
      const diffTime = today - user.lastActiveDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        user.todaySolved = 1;
      } else {
        user.todaySolved += 1;
      }
    }

    user.lastActiveDate = today;

    // =========================
    // STREAK LOGIC
    // =========================
    if (!user.lastSolvedDate) {
      user.currentStreak = 1;
    } else {
      const diffTime = today - user.lastSolvedDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    }

    user.lastSolvedDate = today;

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }
    // 📊 UPDATE DAILY HISTORY
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const existingEntry = user.solveHistory.find(
  (entry) =>
    new Date(entry.date).getTime() === todayDate.getTime()
);

if (existingEntry) {
  existingEntry.count += 1;
} else {
  user.solveHistory.push({
    date: todayDate,
    count: 1
  });
}
    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.syncLeetCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.leetcodeUsername) {
      return res.status(400).json({ message: "LeetCode username not set" });
    }

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              submissionCalendar
            }
          }
        `,
        variables: {
          username: user.leetcodeUsername,
        },
      }),
    });

    const data = await response.json();

    if (!data.data?.matchedUser) {
      return res.status(404).json({ message: "LeetCode user not found" });
    }

    const stats = data.data.matchedUser.submitStats.acSubmissionNum;

    const easy =
      stats.find((s) => s.difficulty === "Easy")?.count || 0;
    const medium =
      stats.find((s) => s.difficulty === "Medium")?.count || 0;
    const hard =
      stats.find((s) => s.difficulty === "Hard")?.count || 0;

    user.easy = easy;
    user.medium = medium;
    user.hard = hard;
    user.totalSolved = easy + medium + hard;

    // ==========================
    // 🔥 STREAK FROM CALENDAR
    // ==========================

    const calendarRaw = data.data.matchedUser.submissionCalendar;
    const calendar = JSON.parse(calendarRaw);

    const timestamps = Object.keys(calendar)
      .map((t) => Number(t))
      .sort((a, b) => a - b);

    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < timestamps.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff =
          (timestamps[i] - timestamps[i - 1]) /
          (60 * 60 * 24);

        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // 🔥 CURRENT STREAK (FROM TODAY BACKWARDS)
    let currentStreak = 0;
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

    while (calendar[today]) {
      currentStreak++;
      today -= 60 * 60 * 24;
    }

    user.currentStreak = currentStreak;
    user.longestStreak = longestStreak;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateLeetCodeUsername = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.leetcodeUsername = leetcodeUsername;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateGoal = async (req, res) => {
  try {
    const { dailyGoal } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.dailyGoal = dailyGoal;
    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.publicLeetCodeStats = async (req, res) => {
  try {
    const { username } = req.params;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "Origin": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!response.ok) {
      console.log("LeetCode status:", response.status);
      return res.status(500).json({ message: "LeetCode API blocked request" });
    }

    const data = await response.json();

    console.log("LeetCode Raw Response:", data);

    if (!data?.data?.matchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats =
      data.data.matchedUser.submitStats.acSubmissionNum;

    const easy =
      stats.find((s) => s.difficulty === "Easy")?.count || 0;

    const medium =
      stats.find((s) => s.difficulty === "Medium")?.count || 0;

    const hard =
      stats.find((s) => s.difficulty === "Hard")?.count || 0;

    return res.json({
      easy,
      medium,
      hard,
      total: easy + medium + hard,
    });

  } catch (error) {
    console.error("🔥 LeetCode Fetch Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

