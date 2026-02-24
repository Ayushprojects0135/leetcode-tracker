const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: 3
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },

    easy: {
        type: Number,
        default: 0,
        min: 0
    },

    medium: {
        type: Number,
        default: 0,
        min: 0
    },

    hard: {
        type: Number,
        default: 0,
        min: 0
    },

    currentStreak: {
        type: Number,
        default: 0,
        },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastSolvedDate: {
    type: Date,
    },
    dailyGoal: {
    type: Number,
    default: 3,
    },

todaySolved: {
    type: Number,
    default: 0,
    },

lastActiveDate: {
  type: Date,
},
leetcodeUsername: {
  type: String,
  default: ""
},
solveHistory: [
  {
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }
],

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field (auto calculated)
userSchema.virtual("totalSolved").get(function () {
    return this.easy + this.medium + this.hard;
});
userSchema.virtual("achievements").get(function () {
  const badges = [];

  // Problem milestones
  if (this.totalSolved >= 50) badges.push("🥉 Bronze Coder");
  if (this.totalSolved >= 100) badges.push("🥈 Silver Coder");
  if (this.totalSolved >= 250) badges.push("🥇 Gold Coder");

  // Streak badges
  if (this.longestStreak >= 7) badges.push("🔥 7 Day Streak");
  if (this.longestStreak >= 30) badges.push("🚀 30 Day Streak");

  return badges;
});
module.exports = mongoose.model("User", userSchema);