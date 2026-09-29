const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    owner: { type: String, default: "me" },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    date: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

checkInSchema.index({ goal: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CheckIn", checkInSchema);