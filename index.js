const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 1. Add expense
app.post('/api/expenses', (req, res) => {
  const { amount, category } = req.body;
  
  if (!amount || !category) {
    return res.status(400).json({ error: 'Amount and category are required' });
  }

  const stmt = db.prepare('INSERT INTO expenses (amount, category) VALUES (?, ?)');
  const info = stmt.run(amount, category);
  
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(expense);
});

// 2. View all expenses
app.get('/api/expenses', (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY timestamp DESC').all();
  res.json(expenses);
});

// 3. Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  
  res.json({ message: 'Deleted successfully' });
});

// 4. Stats: Total Spending & Category Breakdown
app.get('/api/expenses/stats', (req, res) => {
  // Total spending
  const total = db.prepare('SELECT SUM(amount) as total FROM expenses').get();
  
  // Category-wise breakdown
  const breakdown = db.prepare('SELECT category, SUM(amount) as total FROM expenses GROUP BY category').all();
  
  res.json({
    totalSpending: total.total || 0,
    breakdown: breakdown
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
