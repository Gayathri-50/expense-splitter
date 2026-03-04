const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* ---------------- USERS ---------------- */
app.get("/api/users", (req, res) => {
  const db = readData();
  res.json(db.users);
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "name and email required" });
  }

  const db = readData();

  const user = {
    id: uid(),
    name,
    email,
  };

  db.users.push(user);
  writeData(db);

  res.status(201).json(user);
});

/* ---------------- EXPENSES ---------------- */
app.get("/api/expenses", (req, res) => {
  const db = readData();
  res.json(db.expenses);
});

app.post("/api/expenses", (req, res) => {
  const { title, amount, paidBy } = req.body;

  if (!title || amount == null || !paidBy) {
    return res.status(400).json({
      message: "title, amount and paidBy required",
    });
  }

  const db = readData();

  const expense = {
    id: uid(),
    title,
    amount: Number(amount),
    paidBy,
    createdAt: new Date().toISOString(),
  };

  db.expenses.push(expense);
  writeData(db);

  res.status(201).json(expense);
});

/* ---------------- SUMMARY ---------------- */
app.get("/api/summary", (req, res) => {
  const db = readData();
  const users = db.users;
  const expenses = db.expenses;

  if (users.length === 0) {
    return res.json({ total: 0, share: 0, result: [] });
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const share = total / users.length;

  const result = users.map((u) => {
    const paid = expenses
      .filter((e) => e.paidBy === u.id)
      .reduce((s, e) => s + Number(e.amount || 0), 0);

    const balance = +(paid - share).toFixed(2);

    return {
      name: u.name,
      paid: +paid.toFixed(2),
      share: +share.toFixed(2),
      balance,
    };
  });

  res.json({
    total: +total.toFixed(2),
    share: +share.toFixed(2),
    result,
  });
});

/* ---------------- PRODUCTION BUILD ---------------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
