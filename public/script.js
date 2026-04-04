const form = document.getElementById('expense-form');
const totalAmountEl = document.getElementById('total-amount');
const breakdownListEl = document.getElementById('breakdown-list');
const expensesListEl = document.getElementById('expenses-list');
const expenseCountEl = document.getElementById('expense-count');

// Fetch and render data on load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
});

// Update data from the API
async function updateDashboard() {
    try {
        const statsRes = await fetch('/api/expenses/stats');
        const stats = await statsRes.json();
        
        const expensesRes = await fetch('/api/expenses');
        const expenses = await expensesRes.json();
        
        renderStats(stats);
        renderExpenses(expenses);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render summary and breakdown
function renderStats(stats) {
    totalAmountEl.textContent = `₹${parseFloat(stats.totalSpending).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
    breakdownListEl.innerHTML = '';
    stats.breakdown.forEach(item => {
        const span = document.createElement('span');
        span.className = 'category-tag';
        span.textContent = `${item.category}: ₹${item.total}`;
        breakdownListEl.appendChild(span);
    });
}

// Render the expense list
function renderExpenses(expenses) {
    expensesListEl.innerHTML = '';
    expenseCountEl.textContent = `${expenses.length} items`;
    
    expenses.forEach(expense => {
        const div = document.createElement('div');
        div.className = 'expense-item';
        
        const date = new Date(expense.timestamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        div.innerHTML = `
            <div class="expense-info">
                <span class="e-category">${expense.category}</span>
                <span class="e-amount">₹${parseFloat(expense.amount).toFixed(2)}</span>
                <span class="e-date">${date}</span>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expensesListEl.appendChild(div);
    });
}

// Form submission to add expense
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    
    const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category })
    });
    
    if (res.ok) {
        form.reset();
        updateDashboard();
    }
});

// Delete expense
async function deleteExpense(id) {
    const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
    });
    
    if (res.ok) {
        updateDashboard();
    }
}
