import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

export default function App() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const u = await fetch(`${API}/users`).then((r) => r.json());
    const e = await fetch(`${API}/expenses`).then((r) => r.json());
    const s = await fetch(`${API}/summary`).then((r) => r.json());

    setUsers(u);
    setExpenses(e);
    setSummary(s);
  }

  // ===============================
  // ADD USER
  // ===============================
  async function addUser(e) {
    e.preventDefault();

    await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    setName("");
    setEmail("");
    loadAll();
  }

  // ===============================
  // ADD EXPENSE
  // ===============================
  async function addExpense(e) {
    e.preventDefault();

    await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, paidBy }),
    });

    setTitle("");
    setAmount("");
    setPaidBy("");
    loadAll();
  }

  return (
    <div className="container">
      <h1>Expense Splitter</h1>

      <div className="grid">
        {/* ================= USERS ================= */}
        <div className="card">
          <h2>Add User</h2>

          <form onSubmit={addUser}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <button type="submit">Add User</button>
          </form>

          <h3>Users</h3>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                {u.name} — {u.email}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= EXPENSE ================= */}
        <div className="card">
          <h2>Add Expense</h2>

          <form onSubmit={addExpense}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (Lunch)"
              required
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
            />

            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            >
              <option value="">Select Paid By</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="btn-expense"
              disabled={users.length === 0}
            >
              Add Expense
            </button>
          </form>

          <h3>Expenses</h3>
          <ul>
            {expenses.map((e) => {
              const user = users.find((u) => u.id === e.paidBy);
              return (
                <li key={e.id}>
                  <b>{e.title}</b> — ₹{e.amount} — paid by{" "}
                  {user ? user.name : "Unknown"}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h2>Summary</h2>

        {summary && (
          <>
            <p>
              <b>Total:</b> ₹{summary.total} | <b>Each Share:</b> ₹{summary.share}
            </p>

            <ul>
              {summary.result.map((r, i) => (
                <li key={i}>
                  {r.name} — Paid ₹{r.paid} — Balance ₹{r.balance}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}