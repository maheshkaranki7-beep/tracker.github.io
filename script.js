// ==========================================
// SANTHI MONTHLY EXPENSE CALCULATOR
// ==========================================

let expenses = JSON.parse(localStorage.getItem("santhiExpenses")) || [];

// ---------- DOM ELEMENTS ----------

const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const totalExpense = document.getElementById("totalExpense");
const todayExpense = document.getElementById("todayExpense");
const expenseCount = document.getElementById("expenseCount");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");


// ---------- SET TODAY'S DATE ----------

if (expenseDate) {
    expenseDate.value = new Date().toISOString().split("T")[0];
}


// ---------- SAVE DATA ----------

function saveExpenses() {
    localStorage.setItem("santhiExpenses", JSON.stringify(expenses));
}


// ---------- ADD EXPENSE ----------

if (expenseForm) {

    expenseForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = expenseName.value.trim();
        const amount = Number(expenseAmount.value);
        const category = expenseCategory.value;
        const date = expenseDate.value;

        if (name === "" || amount <= 0 || date === "") {
            alert("Please enter valid expense details.");
            return;
        }

        const newExpense = {
            id: Date.now(),
            name: name,
            amount: amount,
            category: category,
            date: date
        };

        expenses.push(newExpense);

        saveExpenses();

        expenseForm.reset();

        expenseDate.value = new Date().toISOString().split("T")[0];

        updateDashboard();

        alert("Expense added successfully! 💰");
    });
}


// ---------- DELETE EXPENSE ----------

function deleteExpense(id) {

    const confirmDelete = confirm("Delete this expense?");

    if (!confirmDelete) {
        return;
    }

    expenses = expenses.filter(function (expense) {
        return expense.id !== id;
    });

    saveExpenses();

    updateDashboard();
}


// ---------- FORMAT MONEY ----------

function formatMoney(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ---------- DISPLAY EXPENSES ----------

function displayExpenses() {

    if (!expenseList) {
        return;
    }

    expenseList.innerHTML = "";

    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💸</div>
                <h3>No expenses yet</h3>
                <p>Add your first monthly expense above.</p>
            </div>
        `;

        return;
    }


    // Latest expenses first
    const sortedExpenses = [...expenses].sort(function (a, b) {

        return new Date(b.date) - new Date(a.date);

    });


    sortedExpenses.forEach(function (expense) {

        const item = document.createElement("div");

        item.className = "expense-item";

        item.innerHTML = `

            <div class="expense-info">

                <div class="expense-icon">
                    ${getCategoryIcon(expense.category)}
                </div>

                <div>
                    <h4>${escapeHTML(expense.name)}</h4>

                    <p>
                        ${escapeHTML(expense.category)}
                        •
                        ${formatDate(expense.date)}
                    </p>
                </div>

            </div>


            <div class="expense-right">

                <strong>
                    ${formatMoney(expense.amount)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                    title="Delete expense"
                >
                    🗑️
                </button>

            </div>

        `;

        expenseList.appendChild(item);

    });
}


// ---------- CATEGORY ICON ----------

function getCategoryIcon(category) {

    const icons = {

        Food: "🍲",

        Groceries: "🛒",

        Transport: "🚗",

        Electricity: "💡",

        Water: "💧",

        Rent: "🏠",

        Shopping: "🛍️",

        Medical: "💊",

        Education: "📚",

        Entertainment: "🎬",

        Bills: "🧾",

        Other: "💰"

    };

    return icons[category] || "💰";
}


// ---------- FORMAT DATE ----------

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",
        month: "short",
        year: "numeric"

    });
}


// ---------- SECURITY ----------

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ---------- CALCULATE TOTAL ----------

function calculateTotal() {

    return expenses.reduce(function (total, expense) {

        return total + Number(expense.amount);

    }, 0);
}


// ---------- TODAY'S EXPENSE ----------

function calculateTodayExpense() {

    const today = new Date().toISOString().split("T")[0];

    return expenses.reduce(function (total, expense) {

        if (expense.date === today) {

            return total + Number(expense.amount);

        }

        return total;

    }, 0);
}


// ---------- UPDATE DASHBOARD ----------

function updateDashboard() {

    const total = calculateTotal();

    const today = calculateTodayExpense();

    if (totalExpense) {
        totalExpense.textContent = formatMoney(total);
    }

    if (todayExpense) {
        todayExpense.textContent = formatMoney(today);
    }

    if (expenseCount) {
        expenseCount.textContent = expenses.length;
    }

    displayExpenses();

    updateCategorySummary();

    updateChart();
}


// ---------- CATEGORY SUMMARY ----------

function updateCategorySummary() {

    const categoryContainer =
        document.getElementById("categorySummary");

    if (!categoryContainer) {
        return;
    }

    categoryContainer.innerHTML = "";

    const categoryTotals = {};

    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }

        categoryTotals[expense.category] +=
            Number(expense.amount);

    });


    const categories = Object.keys(categoryTotals);

    if (categories.length === 0) {

        categoryContainer.innerHTML = `
            <p class="no-data">
                No category data available.
            </p>
        `;

        return;
    }


    categories
        .sort(function (a, b) {

            return categoryTotals[b] - categoryTotals[a];

        })
        .forEach(function (category) {

            const row = document.createElement("div");

            row.className = "category-row";

            row.innerHTML = `

                <div class="category-name">

                    <span class="category-icon">
                        ${getCategoryIcon(category)}
                    </span>

                    <span>
                        ${escapeHTML(category)}
                    </span>

                </div>

                <strong>
                    ${formatMoney(categoryTotals[category])}
                </strong>

            `;

            categoryContainer.appendChild(row);

        });
}


// ---------- CHART ----------

function updateChart() {

    const canvas = document.getElementById("expenseChart");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    const categoryTotals = {};

    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }

        categoryTotals[expense.category] +=
            Number(expense.amount);

    });


    const labels = Object.keys(categoryTotals);

    const values = Object.values(categoryTotals);


    // If Chart.js is available
    if (typeof Chart !== "undefined") {

        if (window.expenseChartInstance) {

            window.expenseChartInstance.destroy();

        }

        window.expenseChartInstance = new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

    }

}


// ---------- CLEAR ALL EXPENSES ----------

function clearAllExpenses() {

    if (expenses.length === 0) {

        alert("There are no expenses to delete.");

        return;

    }

    const confirmation =
        confirm("Are you sure you want to delete ALL expenses?");

    if (!confirmation) {
        return;
    }

    expenses = [];

    saveExpenses();

    updateDashboard();

    alert("All expenses deleted.");
}


// ---------- SEARCH EXPENSES ----------

function searchExpenses() {

    const searchBox =
        document.getElementById("searchExpense");

    if (!searchBox) {
        return;
    }

    const searchText =
        searchBox.value.toLowerCase().trim();

    const filteredExpenses = expenses.filter(function (expense) {

        return (

            expense.name.toLowerCase().includes(searchText) ||

            expense.category.toLowerCase().includes(searchText)

        );

    });


    displayFilteredExpenses(filteredExpenses);
}


// ---------- DISPLAY SEARCH RESULTS ----------

function displayFilteredExpenses(filteredExpenses) {

    if (!expenseList) {
        return;
    }

    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No expenses found</h3>
                <p>Try another search.</p>
            </div>
        `;

        return;
    }


    filteredExpenses.forEach(function (expense) {

        const item = document.createElement("div");

        item.className = "expense-item";

        item.innerHTML = `

            <div class="expense-info">

                <div class="expense-icon">
                    ${getCategoryIcon(expense.category)}
                </div>

                <div>

                    <h4>
                        ${escapeHTML(expense.name)}
                    </h4>

                    <p>
                        ${escapeHTML(expense.category)}
                        •
                        ${formatDate(expense.date)}
                    </p>

                </div>

            </div>


            <div class="expense-right">

                <strong>
                    ${formatMoney(expense.amount)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    🗑️
                </button>

            </div>

        `;

        expenseList.appendChild(item);

    });
}


// ---------- DARK MODE ----------

function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    const darkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "santhiDarkMode",
        darkMode
    );

}


// ---------- LOAD DARK MODE ----------

function loadDarkMode() {

    const darkMode =
        localStorage.getItem("santhiDarkMode");

    if (darkMode === "true") {

        document.body.classList.add("dark-mode");

    }

}


// ---------- EXPORT CSV ----------

function exportExpenses() {

    if (expenses.length === 0) {

        alert("No expenses available to export.");

        return;

    }


    let csv =
        "Expense Name,Amount,Category,Date\n";


    expenses.forEach(function (expense) {

        csv +=
            `"${expense.name}",` +
            `"${expense.amount}",` +
            `"${expense.category}",` +
            `"${expense.date}"\n`;

    });


    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "Santhi-Monthly-Expenses.csv";

    link.click();

    URL.revokeObjectURL(url);

}


// ---------- INITIAL LOAD ----------

document.addEventListener("DOMContentLoaded", function () {

    loadDarkMode();

    updateDashboard();

});
