const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false, // 🔐 NEVER return password by default
    },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    avatar: {
      type: String, // URL or initial (A, B, etc.)
    },

    // 🔐 Forgot password
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
