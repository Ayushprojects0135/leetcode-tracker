const express = require("express");
const router = express.Router();
const User = require("../models/User");   // ✅ ADD THIS

const {
  register,
  login,
  updateUser,
  incrementSolved,
  updateGoal,
  updateLeetCodeUsername,
  syncLeetCode
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: req.params.username },
        { leetcodeUsername: req.params.username }
      ]
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const { publicLeetCodeStats } = require("../controllers/userController");

router.get("/leetcode/:username", publicLeetCodeStats);
router.put("/increment", protect, incrementSolved);
router.put("/goal", protect, updateGoal);
router.put("/leetcode", protect, updateLeetCodeUsername);
router.put("/sync", protect, syncLeetCode);

module.exports = router;