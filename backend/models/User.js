const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    avatar: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
