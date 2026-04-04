# Expense Tracker API & Dashboard

A modern, simple-to-use Expense Tracker built with Node.js, Express, and SQLite.

### Features
- **Add Expenses**: Easily track your spending with category and amount.
- **View History**: See your recent transactions in a clean, glassy UI.
- **Spending Stats**: Automatic total spending calculation and category-wise breakdown.
- **SQLite Storage**: Persistent data without complex setup.
- **Mobile Responsive**: Works across various screen sizes.

### API Endpoints
- `GET /api/expenses`: Retrieve all expenses.
- `POST /api/expenses`: Create a new expense (body: `{ amount, category }`).
- `DELETE /api/expenses/:id`: Remove an expense by ID.
- `GET /api/expenses/stats`: Get total spending and category breakdown.

### Tech Stack
- **Backend**: Node.js & Express
- **Database**: SQLite (via `better-sqlite3`)
- **Frontend**: Vanilla HTML/CSS/JS (Modern & Aesthetic focus)

### How to Run
1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Visit `http://localhost:3000`
