const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: Number,
  paidBy: String,
  participants: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", expenseSchema);