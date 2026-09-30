import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function App() {
  const [goals, setGoals] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  async function loadGoals() {
    try {
      const data = await request("/api/goals");
      setGoals(data.goals);
      setDate(data.date);
    } catch (err) {
      setError("Cannot reach the server. " + err.message);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function addGoal(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please type a goal first");
      return;
    }
    try {
      await request("/api/goals", "POST", { title });
      setTitle("");
      setError("");
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleGoal(goal) {
    try {
      await request(`/api/goals/${goal._id}/check`, "PUT", {
        done: !goal.done,
        date,
      });
      setError("");
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveEdit(id) {
    try {
      await request(`/api/goals/${id}`, "PUT", { title: editTitle });
      setEditingId(null);
      setError("");
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteGoal(id) {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await request(`/api/goals/${id}`, "DELETE");
      setError("");
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <div className="app">
      <h1>Goal Tracker</h1>
      <p className="sub">
        {date} · {doneCount} of {goals.length} done today
      </p>

      <form onSubmit={addGoal} className="add-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a daily goal"
          maxLength={100}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {goals.map((goal) => (
          <li key={goal._id}>
            <input
              type="checkbox"
              checked={goal.done}
              onChange={() => toggleGoal(goal)}
            />
            {editingId === goal._id ? (
              <>
                <input
                  className="edit-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                />
                <button onClick={() => saveEdit(goal._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className={goal.done ? "title done" : "title"}>
                  {goal.title}
                </span>
                <button
                  onClick={() => {
                    setEditingId(goal._id);
                    setEditTitle(goal.title);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => deleteGoal(goal._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {goals.length === 0 && <p className="sub">No goals yet. Add one above.</p>}
    </div>
  );
}

export default App;