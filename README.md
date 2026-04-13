# Xpense | Smart Expense Tracker

A modern, full-stack expense tracking application with a premium UI and real-time data visualization.

## ✨ New Features
- **Visual Analytics**: Interactive doughnut chart showing category-wise spending breakdown using Chart.js.
- **Advanced Filtering**: Search through transactions by description or category.
- **Full CRUD**: Edit existing transactions and update their details.
- **Detailed Tracking**: Support for custom dates and descriptions for every expense.
- **Premium UI**: Glassmorphism design with a bento-style dashboard, dark mode, and smooth animations.
- **Responsive**: Fully optimized for mobile and desktop views.

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+), Chart.js, Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).

## 📁 Project Structure
- `index.js`: Express server and API endpoints.
- `database.js`: SQLite database initialization and schema.
- `public/`: Frontend assets (HTML, CSS, JS).
- `expenses.db`: SQLite database file (generated automatically).
