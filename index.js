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
  const { amount, category, description, date } = req.body;
  
  if (!amount || !category) {
    return res.status(400).json({ error: 'Amount and category are required' });
  }

  const stmt = db.prepare('INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)');
  const info = stmt.run(amount, category, description || null, date || new Date().toISOString().split('T')[0]);
  
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(expense);
});

// 2. View all expenses (with search/filter)
app.get('/api/expenses', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (description LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY date DESC, timestamp DESC';
  const expenses = db.prepare(query).all(...params);
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

// 4. Update expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;
  
  const info = db.prepare(`
    UPDATE expenses 
    SET amount = ?, category = ?, description = ?, date = ? 
    WHERE id = ?
  `).run(amount, category, description, date, id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  res.json(expense);
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
