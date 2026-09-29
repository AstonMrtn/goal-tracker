Your Goal Tracker plan (v1)
1. Features
Add a daily goal
See today's goals, each done or not done
Tick or untick a goal for today
Edit a goal's title
Delete a goal

A "daily goal" here is a habit that repeats every day, like "Practice editing 1 hour". You tick it once per day. This is what makes history and streaks possible in V2.

2. Architecture

Frontend (React), one page called Today:

AddGoalForm: text box and Add button
GoalList: shows all goals
GoalItem: checkbox, title, Edit and Delete buttons

Backend (Express) routes:

Route	Does
GET /api/goals?date=2026-09-29	Goals plus done/not done for that date
POST /api/goals	Add a goal
PUT /api/goals/:id	Edit the title
DELETE /api/goals/:id	Delete a goal
PUT /api/goals/:id/check	Set done or not done for a date
3. Database (two collections in v1)

Goal

owner: text, always "me" for now
title: text, required, trimmed, max 100 characters
createdAt: date

CheckIn (one record per goal per day)

owner: text
goal: the ID of the Goal
date: text like "2026-09-29"
done: true or false
Rule: only one CheckIn per goal per date

Track is designed but not built yet. I said earlier to build it from day one, but nothing uses it in v1, so we'll add it in V3. The owner field is what makes that easy.

4. Edge cases
Empty or spaces-only title: reject
Title over 100 characters: reject
Ticking the same goal twice in one day: update the existing CheckIn, don't create a second one
Invalid or missing goal ID: return a clear 404 or 400 error
Deleting a goal that has CheckIns: delete those CheckIns too in v1
A goal created today shouldn't show as "missed" on earlier days
India time: Render's servers run on UTC, so a goal ticked at 1 AM IST could land on yesterday's date. We'll work out "today" using the Asia/Kolkata timezone, and store dates as plain text like "2026-09-29" so timezones can't shift them.
