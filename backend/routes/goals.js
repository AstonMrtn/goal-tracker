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
module.exports = router;
