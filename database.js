const Database = require('better-sqlite3');
const db = new Database('expenses.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT DEFAULT (DATE('now')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrations: Ensure new columns exist for existing databases
try {
  db.exec('ALTER TABLE expenses ADD COLUMN description TEXT');
} catch (e) {
  // Column might already exist
}

try {
  db.exec("ALTER TABLE expenses ADD COLUMN date TEXT DEFAULT (DATE('now'))");
} catch (e) {
  // Column might already exist
}

module.exports = db;
