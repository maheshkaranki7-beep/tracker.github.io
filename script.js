/* =========================================================
   MONTHLY EXPENSE TRACKER
   Advanced • Colorful • Mobile Friendly
   ========================================================= */

const STORAGE_KEY = "monthlyExpenseTrackerData";

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    budget: 10000,
    expenses: []
};

let selectedMonth =
    new Date().toISOString().slice(0, 7);

let pieChart = null;


/* =========================================================
   ELEMENT HELPERS
   ========================================================= */

function getElement(...ids) {
    for (const id of ids) {
        const element = document.getElementById(id);
        if (element) return element;
    }
    return null;
}


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function getCurrentMonth() {
    return selectedMonth;
}


/* =========================================================
   MONTH EXPENSES
   ========================================================= */

function getMonthExpenses() {

    return appData.expenses.filter(expense => {

        return expense.date &&
            expense.date.slice(0, 7) === getCurrentMonth();

    });
}


/* =========================================================
   TOTAL EXPENSE
   ========================================================= */

function getTotalExpense() {

    return getMonthExpenses().reduce(
        (total, expense) =>
            total + Number(expense.amount),
        0
    );
}


/* =========================================================
   REMAINING MONEY
   ========================================================= */

function getRemaining() {

    return Number(appData.budget) - getTotalExpense();

}


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function money(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

}


/* =========================================================
   FORMAT MONTH
   ========================================================= */

function formatMonth(month) {

    const date = new Date(month + "-01");

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

}


/* =========================================================
   UPDATE BUDGET
   ========================================================= */

function updateBudget() {

    const budgetInput = getElement(
        "budget",
        "monthlyBudget",
        "budgetInput"
    );

    if (!budgetInput) return;

    const newBudget =
        Number(budgetInput.value);

    if (isNaN(newBudget) || newBudget < 0) {

        alert("Please enter a valid budget.");

        return;
    }

    appData.budget = newBudget;

    saveData();

    updateDashboard();

}


/* =========================================================
   EDIT BUDGET
   ========================================================= */

function editBudget() {

    const currentBudget =
        Number(appData.budget);

    const newBudget =
        prompt(
            "Enter your monthly budget:",
            currentBudget
        );

    if (newBudget === null) return;

    const value =
        Number(newBudget);

    if (isNaN(value) || value < 0) {

        alert("Please enter a valid amount.");

        return;
    }

    appData.budget = value;

    saveData();

    updateDashboard();

}


/* =========================================================
   ADD EXPENSE
   ========================================================= */

function addExpense(event) {

    if (event) {
        event.preventDefault();
    }

    const nameInput = getElement(
        "name",
        "expenseName"
    );

    const amountInput = getElement(
        "amount",
        "expenseAmount"
    );

    const categoryInput = getElement(
        "category",
        "expenseCategory"
    );

    const dateInput = getElement(
        "date",
        "expenseDate"
    );


    if (!nameInput || !amountInput) {

        alert(
            "Expense form fields are missing."
        );

        return;
    }


    const name =
        nameInput.value.trim();

    const amount =
        Number(amountInput.value);

    const category =
        categoryInput ?
            categoryInput.value :
            "Other";

    const date =
        dateInput && dateInput.value ?
            dateInput.value :
            new Date().toISOString().slice(0, 10);


    if (!name) {

        alert("Please enter an expense name.");

        return;
    }


    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }


    const expense = {

        id: Date.now(),

        name: name,

        amount: amount,

        category:
            category || "Other",

        date: date

    };


    appData.expenses.push(expense);

    saveData();

    nameInput.value = "";

    amountInput.value = "";


    updateDashboard();


    showMessage(
        "Expense added successfully! 💰"
    );

}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if (!confirmDelete) return;


    appData.expenses =
        appData.expenses.filter(
            expense =>
                expense.id !== id
        );


    saveData();

    updateDashboard();

}


/* =========================================================
   CLEAR CURRENT MONTH
   ========================================================= */

function clearCurrentMonth() {

    const monthExpenses =
        getMonthExpenses();

    if (monthExpenses.length === 0) {

        alert(
            "There are no expenses for this month."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete all expenses for ${formatMonth(selectedMonth)}?`
        );


    if (!confirmed) return;


    appData.expenses =
        appData.expenses.filter(
            expense =>
                expense.date.slice(0, 7) !==
                selectedMonth
        );


    saveData();

    updateDashboard();

}


/* =========================================================
   DISPLAY EXPENSES
   ========================================================= */

function displayExpenses() {

    const list =
        getElement(
            "expenseList",
            "expensesList",
            "expenseHistory"
        );

    if (!list) return;


    list.innerHTML = "";


    const expenses =
        [...getMonthExpenses()].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    if (expenses.length === 0) {

        list.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    💸
                </div>

                <h3>No expenses yet</h3>

                <p>
                    Add an expense to see it here.
                </p>

            </div>

        `;

        return;
    }


    expenses.forEach(expense => {

        const item =
            document.createElement("div");


        item.className =
            "expense-item";


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
                    ${money(expense.amount)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                    aria-label="Delete expense"
                >
                    🗑️
                </button>

            </div>

        `;


        list.appendChild(item);

    });

}


/* =========================================================
   CATEGORY ICONS
   ========================================================= */

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

        Fuel: "⛽",

        Travel: "✈️",

        Other: "💰"

    };


    return icons[category] || "💰";

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CATEGORY TOTALS
   ========================================================= */

function getCategoryTotals() {

    const totals = {};

    getMonthExpenses().forEach(expense => {

        const category =
            expense.category || "Other";


        if (!totals[category]) {

            totals[category] = 0;

        }


        totals[category] +=
            Number(expense.amount);

    });


    return totals;

}


/* =========================================================
   CATEGORY SUMMARY
   ========================================================= */

function displayCategorySummary() {

    const container =
        getElement(
            "categorySummary",
            "categoryList"
        );

    if (!container) return;


    container.innerHTML = "";


    const totals =
        getCategoryTotals();


    const categories =
        Object.keys(totals);


    if (categories.length === 0) {

        container.innerHTML = `
            <p class="no-data">
                No category data yet.
            </p>
        `;

        return;
    }


    categories
        .sort(
            (a, b) =>
                totals[b] -
                totals[a]
        )
        .forEach(category => {

            const row =
                document.createElement("div");


            row.className =
                "category-row";


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
                    ${money(totals[category])}
                </strong>

            `;


            container.appendChild(row);

        });

}


/* =========================================================
   PIE CHART
   ========================================================= */

function updateChart() {

    const canvas =
        getElement(
            "expenseChart",
            "pieChart",
            "categoryChart"
        );

    if (!canvas) return;


    const totals =
        getCategoryTotals();


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    if (
        typeof Chart === "undefined"
    ) {

        console.log(
            "Chart.js is not loaded."
        );

        return;
    }


    if (pieChart) {

        pieChart.destroy();

    }


    const ctx =
        canvas.getContext("2d");


    pieChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    borderWidth: 3,

                    borderColor: "#ffffff",

                    backgroundColor: [

                        "#7c3aed",

                        "#ec4899",

                        "#2563eb",

                        "#06b6d4",

                        "#10b981",

                        "#f97316",

                        "#eab308",

                        "#ef4444",

                        "#8b5cf6",

                        "#14b8a6"

                    ]

                }]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "62%",


                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            padding: 15,

                            usePointStyle: true,

                            font: {

                                size: 13

                            }

                        }

                    }

                },


                animation: {

                    animateRotate: true,

                    animateScale: true,

                    duration: 1000

                }

            }

        });

}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        getTotalExpense();


    const budget =
        Number(appData.budget);


    const remaining =
        budget - total;


    const totalElement =
        getElement(
            "totalExpense",
            "totalExpenses"
        );


    const budgetElement =
        getElement(
            "budgetDisplay",
            "monthlyBudgetDisplay",
            "budgetAmount"
        );


    const remainingElement =
        getElement(
            "remaining",
            "remainingAmount"
        );


    const countElement =
        getElement(
            "expenseCount",
            "totalCount"
        );


    if (totalElement) {

        totalElement.textContent =
            money(total);

    }


    if (budgetElement) {

        budgetElement.textContent =
            money(budget);

    }


    if (remainingElement) {

        remainingElement.textContent =
            money(remaining);

        if (remaining < 0) {

            remainingElement.classList.add(
                "negative"
            );

        } else {

            remainingElement.classList.remove(
                "negative"
            );

        }

    }


    if (countElement) {

        countElement.textContent =
            getMonthExpenses().length;

    }


    updateBudgetInput();

    updateMonthDisplay();

    displayExpenses();

    displayCategorySummary();

    updateChart();

}


/* =========================================================
   UPDATE BUDGET INPUT
   ========================================================= */

function updateBudgetInput() {

    const input =
        getElement(
            "budget",
            "monthlyBudget",
            "budgetInput"
        );


    if (input) {

        input.value =
            appData.budget;

    }

}


/* =========================================================
   MONTH SELECTOR
   ========================================================= */

function updateMonthDisplay() {

    const monthInput =
        getElement(
            "month",
            "monthPicker",
            "selectedMonth"
        );


    if (monthInput) {

        monthInput.value =
            selectedMonth;

    }


    const monthText =
        getElement(
            "monthTitle",
            "currentMonth",
            "selectedMonthText"
        );


    if (monthText) {

        monthText.textContent =
            formatMonth(selectedMonth);

    }

}


/* =========================================================
   CHANGE MONTH
   ========================================================= */

function changeMonth(value) {

    if (!value) return;

    selectedMonth = value;

    updateDashboard();

}


/* =========================================================
   EXPORT CSV
   ========================================================= */

function exportExpenses() {

    const expenses =
        getMonthExpenses();


    if (expenses.length === 0) {

        alert(
            "No expenses to export for this month."
        );

        return;
    }


    let csv =
        "Expense Name,Amount,Category,Date\n";


    expenses.forEach(expense => {

        csv +=
            `"${escapeCSV(expense.name)}",` +
            `"${expense.amount}",` +
            `"${escapeCSV(expense.category)}",` +
            `"${expense.date}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `Expenses-${selectedMonth}.csv`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================================
   CSV ESCAPE
   ========================================================= */

function escapeCSV(value) {

    return String(value)
        .replace(/"/g, '""');

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value);


    return div.innerHTML;

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchExpenses() {

    const searchInput =
        getElement(
            "search",
            "searchExpense"
        );


    const list =
        getElement(
            "expenseList",
            "expensesList",
            "expenseHistory"
        );


    if (!searchInput || !list) return;


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const results =
        getMonthExpenses().filter(expense => {

            return (

                expense.name
                    .toLowerCase()
                    .includes(query)

                ||

                expense.category
                    .toLowerCase()
                    .includes(query)

            );

        });


    list.innerHTML = "";


    if (results.length === 0) {

        list.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No expenses found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;
    }


    results.forEach(expense => {

        const item =
            document.createElement("div");


        item.className =
            "expense-item";


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
                    ${money(expense.amount)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    🗑️
                </button>

            </div>

        `;


        list.appendChild(item);

    });

}


/* =========================================================
   DARK MODE
   ========================================================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const enabled =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "expenseDarkMode",
        enabled
    );

}


/* =========================================================
   LOAD DARK MODE
   ========================================================= */

function loadDarkMode() {

    const enabled =
        localStorage.getItem(
            "expenseDarkMode"
        );


    if (enabled === "true") {

        document.body.classList.add(
            "dark-mode"
        );

    }

}


/* =========================================================
   SMALL MESSAGE
   ========================================================= */

function showMessage(message) {

    let toast =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {

        toast =
            document.createElement("div");


        toast.id =
            "toastMessage";


        toast.style.position =
            "fixed";


        toast.style.bottom =
            "25px";


        toast.style.left =
            "50%";


        toast.style.transform =
            "translateX(-50%)";


        toast.style.padding =
            "14px 22px";


        toast.style.borderRadius =
            "15px";


        toast.style.background =
            "linear-gradient(135deg,#7c3aed,#ec4899)";


        toast.style.color =
            "white";


        toast.style.fontWeight =
            "700";


        toast.style.zIndex =
            "9999";


        toast.style.boxShadow =
            "0 15px 40px rgba(0,0,0,.25)";


        document.body.appendChild(toast);

    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    setTimeout(() => {

        toast.style.display =
            "none";

    }, 2500);

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDarkMode();


        const form =
            getElement(
                "expenseForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                addExpense
            );

        }


        const monthInput =
            getElement(
                "month",
                "monthPicker",
                "selectedMonth"
            );


        if (monthInput) {

            monthInput.addEventListener(
                "change",
                function () {

                    changeMonth(
                        this.value
                    );

                }
            );

        }


        const searchInput =
            getElement(
                "search",
                "searchExpense"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchExpenses
            );

        }


        const budgetButton =
            getElement(
                "editBudget",
                "budgetEdit",
                "changeBudget"
            );


        if (budgetButton) {

            budgetButton.addEventListener(
                "click",
                editBudget
            );

        }


        const exportButton =
            getElement(
                "exportBtn",
                "exportExpenses"
            );


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportExpenses
            );

        }


        const clearButton =
            getElement(
                "clearBtn",
                "clearExpenses"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearCurrentMonth
            );

        }


        updateDashboard();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.deleteExpense =
    deleteExpense;

window.editBudget =
    editBudget;

window.updateBudget =
    updateBudget;

window.changeMonth =
    changeMonth;

window.toggleDarkMode =
    toggleDarkMode;

window.exportExpenses =
    exportExpenses;

window.clearCurrentMonth =
    clearCurrentMonth;

window.searchExpenses =
    searchExpenses;

