const mongoose = require("mongoose");
const express = require("express");
const Goal = require("../models/Goal");
const CheckIn = require("../models/CheckIn");

const todayIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: "Title must be 100 characters or less" });
    }

    const goal = await Goal.create({ title, owner: "me" });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const date = req.query.date || todayIST();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Date must look like 2026-09-29" });
    }

    const goals = await Goal.find({ owner: "me" }).sort({ createdAt: 1 });
    const checkIns = await CheckIn.find({ owner: "me", date });
    const doneIds = new Set(
      checkIns.filter((c) => c.done).map((c) => c.goal.toString())
    );

    const result = goals.map((g) => ({
      _id: g._id,
      title: g.title,
      done: doneIds.has(g._id.toString()),
    }));

    res.json({ date, goals: result });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:id/check", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid goal id" });
    }
    if (typeof req.body.done !== "boolean") {
      return res.status(400).json({ error: "done must be true or false" });
    }

    const date = req.body.date || todayIST();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Date must look like 2026-09-29" });
    }

    const goal = await Goal.findOne({ _id: id, owner: "me" });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const checkIn = await CheckIn.findOneAndUpdate(
      { goal: id, date, owner: "me" },
      { done: req.body.done },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(checkIn);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
