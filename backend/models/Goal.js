const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    owner: { type: String, default: "me" },
    title: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);