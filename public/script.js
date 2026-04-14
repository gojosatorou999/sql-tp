let categoryChart = null;
let trendChart = null;
let monthlyBudget = 0;

// DOM Elements
const form = document.getElementById('expense-form');
const totalAmountEl = document.getElementById('total-amount');
const todayAmountEl = document.getElementById('today-amount');
const monthlyAmountEl = document.getElementById('monthly-amount');
const expensesListEl = document.getElementById('expenses-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const dateInput = document.getElementById('date');

// Budget Elements
const budgetProgressText = document.getElementById('budget-progress-text');
const budgetRemainingText = document.getElementById('budget-remaining-text');
const budgetFill = document.getElementById('budget-fill');
const monthlyBudgetValue = document.getElementById('monthly-budget-value');
const openBudgetModalBtn = document.getElementById('open-budget-modal');
const budgetModal = document.getElementById('budget-modal');
const budgetForm = document.getElementById('budget-form');
const closeBudgetModalBtn = document.getElementById('close-budget-modal');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModalBtn = document.getElementById('close-modal');

// Export button
const exportBtn = document.getElementById('export-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    fetchBudget();
    updateDashboard();
});

async function fetchBudget() {
    try {
        const res = await fetch('/api/budget');
        const data = await res.json();
        monthlyBudget = data.budget;
        monthlyBudgetValue.textContent = `₹${monthlyBudget.toLocaleString()}`;
    } catch (error) {
        console.error('Error fetching budget:', error);
    }
}

// Event Listeners for Filtering
searchInput.addEventListener('input', debounce(() => updateDashboard(), 300));
categoryFilter.addEventListener('change', () => updateDashboard());

// Helper: Debounce for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update data from the API
async function updateDashboard() {
    try {
        const search = searchInput.value;
        const category = categoryFilter.value;
        
        let url = `/api/expenses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;
        
        const expensesRes = await fetch(url);
        const expenses = await expensesRes.json();
        
        const statsRes = await fetch('/api/expenses/stats');
        const stats = await statsRes.json();
        
        renderStats(stats);
        updateBudgetProgress(stats.monthlyTotal);
        renderChart(stats.breakdown);
        renderTrendChart(stats.trends);
        renderExpenses(expenses);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render summary
function renderStats(stats) {
    const format = (val) => `₹${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    totalAmountEl.textContent = format(stats.totalSpending);
    todayAmountEl.textContent = format(stats.todayTotal);
    monthlyAmountEl.textContent = format(stats.monthlyTotal);
}

function updateBudgetProgress(monthlyTotal) {
    if (monthlyBudget <= 0) return;

    const percent = Math.min((monthlyTotal / monthlyBudget) * 100, 100);
    const remaining = Math.max(monthlyBudget - monthlyTotal, 0);

    budgetFill.style.width = `${percent}%`;
    budgetProgressText.textContent = `${Math.round((monthlyTotal / monthlyBudget) * 100)}% used`;
    budgetRemainingText.textContent = `₹${remaining.toLocaleString()} left`;

    // Color feedback
    budgetFill.classList.remove('warning', 'danger');
    if (percent >= 100) {
        budgetFill.classList.add('danger');
    } else if (percent >= 80) {
        budgetFill.classList.add('warning');
    }
}

// Render Chart.js
function renderChart(breakdown) {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    const labels = breakdown.map(item => item.category);
    const data = breakdown.map(item => item.total);
    const colors = [
        '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6366f1'
    ];

    if (categoryChart) {
        categoryChart.destroy();
    }

    if (data.length === 0) return;

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#9ca3af',
                        usePointStyle: true,
                        padding: 20,
                        font: { family: 'Outfit', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ₹${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Render Trend Chart
function renderTrendChart(trends) {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    const labels = trends.map(item => item.month);
    const data = trends.map(item => item.total);

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending',
                data: data,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ₹${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(156, 163, 175, 0.1)' },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Render the expense list
function renderExpenses(expenses) {
    expensesListEl.innerHTML = '';
    
    if (expenses.length === 0) {
        expensesListEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="folder-open"></i>
                <p>No transactions found</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    expenses.forEach((expense, index) => {
        const div = document.createElement('div');
        div.className = 'expense-card';
        div.style.animationDelay = `${index * 0.05}s`;
        
        const date = new Date(expense.date || expense.timestamp).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const emojiMap = {
            'Food': '🍔', 'Travel': '🚗', 'Health': '💊', 'Shopping': '🛍️', 
            'Bills': '🧾', 'Entertainment': '🎬', 'Other': '✨'
        };

        div.innerHTML = `
            <div class="cat-icon">${emojiMap[expense.category] || '💰'}</div>
            <div class="expense-main">
                <span class="expense-category">${expense.category}</span>
                <span class="expense-desc">${expense.description || 'No description'}</span>
                <span class="expense-date">${date}</span>
            </div>
            <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
            <div class="expense-actions">
                <button class="action-btn edit" onclick="openEditModal(${JSON.stringify(expense).replace(/"/g, '&quot;')})">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="action-btn delete" onclick="deleteExpense(${expense.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        expensesListEl.appendChild(div);
    });
    
    lucide.createIcons();
}

// Form submissions
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, date, description })
    });
    
    if (res.ok) {
        form.reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        updateDashboard();
    }
});

// Budget form
budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('budget-amount').value;
    
    const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    
    if (res.ok) {
        budgetModal.style.display = 'none';
        fetchBudget().then(() => updateDashboard());
    }
});

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) updateDashboard();
}

// Modal Handlers
function openEditModal(expense) {
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;
    document.getElementById('edit-description').value = expense.description || '';
    editModal.style.display = 'flex';
    lucide.createIcons();
}

closeModalBtn.onclick = () => editModal.style.display = 'none';
openBudgetModalBtn.onclick = () => {
    document.getElementById('budget-amount').value = monthlyBudget;
    budgetModal.style.display = 'flex';
    lucide.createIcons();
};
closeBudgetModalBtn.onclick = () => budgetModal.style.display = 'none';

window.onclick = (e) => {
    if (e.target === editModal) editModal.style.display = 'none';
    if (e.target === budgetModal) budgetModal.style.display = 'none';
};

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const body = {
        amount: document.getElementById('edit-amount').value,
        category: document.getElementById('edit-category').value,
        date: document.getElementById('edit-date').value,
        description: document.getElementById('edit-description').value
    };
    const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        editModal.style.display = 'none';
        updateDashboard();
    }
});

// CSV Export
exportBtn.addEventListener('click', async () => {
    try {
        const search = searchInput.value;
        const category = categoryFilter.value;
        const url = `/api/expenses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['ID', 'Date', 'Category', 'Amount', 'Description'];
        const rows = data.map(e => [e.id, e.date, e.category, e.amount, `"${e.description || ''}"`]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', downloadUrl);
        a.setAttribute('download', `xpense_report_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
    } catch (error) {
        console.error('Export failed:', error);
    }
});
