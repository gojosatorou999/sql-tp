let categoryChart = null;

// DOM Elements
const form = document.getElementById('expense-form');
const totalAmountEl = document.getElementById('total-amount');
const expensesListEl = document.getElementById('expenses-list');
const expenseCountEl = document.getElementById('expense-count');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const dateInput = document.getElementById('date');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModalBtn = document.getElementById('close-modal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    updateDashboard();
});

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
        renderChart(stats.breakdown);
        renderExpenses(expenses);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render summary
function renderStats(stats) {
    totalAmountEl.textContent = `₹${parseFloat(stats.totalSpending).toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
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

    if (data.length === 0) {
        // Handle empty state for chart if needed
        return;
    }

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
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Render the expense list
function renderExpenses(expenses) {
    expensesListEl.innerHTML = '';
    expenseCountEl.textContent = expenses.length;
    
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

        // Simple emoji map based on category
        const emojiMap = {
            'Food': '🍔',
            'Travel': '🚗',
            'Health': '💊',
            'Shopping': '🛍️',
            'Bills': '🧾',
            'Entertainment': '🎬',
            'Other': '✨'
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

// Form submission to add expense
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
        // Reset date to today after submit
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        updateDashboard();
    }
});

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
    });
    
    if (res.ok) {
        updateDashboard();
    }
}

// Edit Modal Logic
function openEditModal(expense) {
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date || expense.timestamp.split(' ')[0];
    document.getElementById('edit-description').value = expense.description || '';
    
    editModal.style.display = 'flex';
    lucide.createIcons();
}

closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value;
    const date = document.getElementById('edit-date').value;
    const description = document.getElementById('edit-description').value;
    
    const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, date, description })
    });
    
    if (res.ok) {
        editModal.style.display = 'none';
        updateDashboard();
    }
});
