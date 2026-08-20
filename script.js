/* =========================================================
   MY MONTHLY BUDGET
   Complete Application JavaScript
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "myMonthlyBudgetData";

let appData = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    budgets: {},
    expenses: {},
    darkMode: false
};


/* =========================================================
   ELEMENTS
========================================================= */

const monthSelect =
    document.getElementById("monthSelect");

const monthLabel =
    document.getElementById("monthLabel");

const budgetInput =
    document.getElementById("budgetInput");

const saveBudgetBtn =
    document.getElementById("saveBudgetBtn");

const expenseAmount =
    document.getElementById("expenseAmount");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const selectedCategory =
    document.getElementById("selectedCategory");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const totalSpent =
    document.getElementById("totalSpent");

const remainingBudget =
    document.getElementById("remainingBudget");

const budgetPercentage =
    document.getElementById("budgetPercentage");

const budgetStatus =
    document.getElementById("budgetStatus");

const progressBar =
    document.getElementById("progressBar");

const expenseList =
    document.getElementById("expenseList");

const emptyState =
    document.getElementById("emptyState");

const expenseCount =
    document.getElementById("expenseCount");

const categorySummary =
    document.getElementById("categorySummary");

const expenseChart =
    document.getElementById("expenseChart");

const themeBtn =
    document.getElementById("themeBtn");

const clearDataBtn =
    document.getElementById("clearDataBtn");


let chartInstance = null;


/* =========================================================
   CURRENT MONTH
========================================================= */

const today = new Date();

const currentMonth =
    String(today.getMonth() + 1).padStart(2, "0");

monthSelect.value = currentMonth;


/* =========================================================
   SAVE APPLICATION DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


/* =========================================================
   GET CURRENT MONTH
========================================================= */

function getCurrentMonth() {

    return monthSelect.value;

}


/* =========================================================
   GET MONTH NAME
========================================================= */

function getMonthName(monthNumber) {

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return months[
        Number(monthNumber) - 1
    ];

}


/* =========================================================
   UPDATE MONTH LABEL
========================================================= */

function updateMonthLabel() {

    const month =
        getCurrentMonth();

    monthLabel.textContent =
        getMonthName(month);

}


/* =========================================================
   ENSURE MONTH EXISTS
========================================================= */

function ensureMonthExists(month) {

    if (!appData.expenses[month]) {

        appData.expenses[month] = [];

    }

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0
            }
        );

}


/* =========================================================
   LOAD BUDGET
========================================================= */

function loadBudget() {

    const month =
        getCurrentMonth();

    const budget =
        appData.budgets[month] || 0;

    budgetInput.value =
        budget > 0 ? budget : "";

}


/* =========================================================
   SAVE BUDGET
========================================================= */

saveBudgetBtn.addEventListener(
    "click",
    function () {

        const month =
            getCurrentMonth();

        const value =
            Number(budgetInput.value);

        if (
            !value ||
            value < 0
        ) {

            alert(
                "Please enter a valid budget amount."
            );

            return;

        }

        appData.budgets[month] =
            value;

        saveData();

        updateDashboard();

        saveBudgetBtn.textContent =
            "Saved ✓";

        setTimeout(
            function () {

                saveBudgetBtn.textContent =
                    "Save";

            },
            1500
        );

    }
);


/* =========================================================
   ALLOW ENTER KEY FOR BUDGET
========================================================= */

budgetInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            saveBudgetBtn.click();

        }

    }
);


/* =========================================================
   CATEGORY SELECTION
========================================================= */

categoryButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                categoryButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                selectedCategory.value =
                    button.dataset.category;

            }
        );

    }
);


/* =========================================================
   ADD EXPENSE
========================================================= */

addExpenseBtn.addEventListener(
    "click",
    function () {

        const amount =
            Number(expenseAmount.value);

        const category =
            selectedCategory.value;

        const month =
            getCurrentMonth();


        if (
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please enter an expense amount."
            );

            expenseAmount.focus();

            return;

        }


        ensureMonthExists(month);


        const expense = {

            id:
                Date.now(),

            amount:
                amount,

            category:
                category,

            date:
                new Date().toISOString(),

        };


        appData.expenses[month].push(
            expense
        );


        saveData();


        expenseAmount.value =
            "";


        updateDashboard();


        addExpenseBtn.innerHTML =
            "<span>✓</span> Added";


        setTimeout(
            function () {

                addExpenseBtn.innerHTML =
                    "<span>＋</span> Add Expense";

            },
            1000
        );

    }
);


/* =========================================================
   ENTER KEY FOR EXPENSE
========================================================= */

expenseAmount.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addExpenseBtn.click();

        }

    }
);


/* =========================================================
   GET MONTH EXPENSES
========================================================= */

function getMonthExpenses() {

    const month =
        getCurrentMonth();

    ensureMonthExists(month);

    return appData.expenses[month];

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateTotal() {

    const expenses =
        getMonthExpenses();

    return expenses.reduce(
        function (total, expense) {

            return total +
                Number(expense.amount);

        },
        0
    );

}


/* =========================================================
   GET BUDGET
========================================================= */

function getBudget() {

    const month =
        getCurrentMonth();

    return Number(
        appData.budgets[month] || 0
    );

}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    updateMonthLabel();

    loadBudget();

    updateSummary();

    updateProgress();

    displayExpenses();

    updateCategorySummary();

    updateChart();

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const budget =
        getBudget();

    const spent =
        calculateTotal();

    const remaining =
        budget - spent;


    totalSpent.textContent =
        formatMoney(spent);


    remainingBudget.textContent =
        formatMoney(
            Math.max(remaining, 0)
        );


    if (remaining < 0) {

        remainingBudget.style.color =
            "#ef5350";

    } else {

        remainingBudget.style.color =
            "";

    }

}


/* =========================================================
   PROGRESS BAR
========================================================= */

function updateProgress() {

    const budget =
        getBudget();

    const spent =
        calculateTotal();


    if (budget <= 0) {

        progressBar.style.width =
            "0%";

        budgetPercentage.textContent =
            "0%";

        budgetStatus.textContent =
            "Set your budget to start";

        return;

    }


    const percentage =
        Math.round(
            (spent / budget) * 100
        );


    const displayPercentage =
        Math.min(
            percentage,
            100
        );


    progressBar.style.width =
        displayPercentage + "%";


    budgetPercentage.textContent =
        percentage + "%";


    if (percentage < 50) {

        budgetStatus.textContent =
            "You're doing great! 😊";

    }

    else if (percentage < 80) {

        budgetStatus.textContent =
            "Keep an eye on spending 👀";

    }

    else if (percentage < 100) {

        budgetStatus.textContent =
            "Almost at your limit ⚠️";

    }

    else if (percentage === 100) {

        budgetStatus.textContent =
            "Budget fully used";

    }

    else {

        budgetStatus.textContent =
            "You've exceeded your budget 🚨";

    }

}


/* =========================================================
   CATEGORY ICON
========================================================= */

function getCategoryIcon(category) {

    const icons = {

        Food: "🍲",

        Groceries: "🛒",

        Transport: "🚗",

        Bills: "🧾",

        Shopping: "🛍️",

        Medical: "💊",

        Home: "🏠",

        Other: "✨"

    };

    return (
        icons[category] ||
        "✨"
    );

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
            month: "short"
        }
    );

}


/* =========================================================
   DISPLAY EXPENSES
========================================================= */

function displayExpenses() {

    const expenses =
        [...getMonthExpenses()]
            .reverse();


    expenseCount.textContent =
        expenses.length;


    expenseList.innerHTML =
        "";


    if (expenses.length === 0) {

        expenseList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    No expenses yet
                </h3>

                <p>
                    Add your first expense above.
                </p>

            </div>

        `;

        return;

    }


    expenses.forEach(
        function (expense) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "expense-item";


            item.innerHTML = `

                <div class="expense-info">

                    <div class="expense-icon">
                        ${getCategoryIcon(
                            expense.category
                        )}
                    </div>

                    <div>

                        <h4>
                            ${expense.category}
                        </h4>

                        <p>
                            ${formatDate(
                                expense.date
                            )}
                        </p>

                    </div>

                </div>


                <div class="expense-right">

                    <strong>
                        ${formatMoney(
                            expense.amount
                        )}
                    </strong>

                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${expense.id}"
                        aria-label="Delete expense"
                    >
                        🗑️
                    </button>

                </div>

            `;


            const deleteButton =
                item.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteExpense(
                        expense.id
                    );

                }
            );


            expenseList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(id) {

    const month =
        getCurrentMonth();


    const confirmDelete =
        confirm(
            "Delete this expense?"
        );


    if (!confirmDelete) {
        return;
    }


    appData.expenses[month] =
        appData.expenses[month]
            .filter(
                function (expense) {

                    return expense.id !== id;

                }
            );


    saveData();

    updateDashboard();

}


/* =========================================================
   CATEGORY SUMMARY
========================================================= */

function updateCategorySummary() {

    const expenses =
        getMonthExpenses();

    const totals = {};


    expenses.forEach(
        function (expense) {

            if (
                !totals[expense.category]
            ) {

                totals[expense.category] =
                    0;

            }

            totals[expense.category] +=
                Number(expense.amount);

        }
    );


    const categories =
        Object.keys(totals)
            .sort(
                function (a, b) {

                    return (
                        totals[b] -
                        totals[a]
                    );

                }
            );


    categorySummary.innerHTML =
        "";


    if (categories.length === 0) {

        categorySummary.innerHTML = `

            <p class="no-data">
                Your spending breakdown
                will appear here.
            </p>

        `;

        return;

    }


    categories.forEach(
        function (category) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "category-row";


            row.innerHTML = `

                <div class="category-name">

                    <span class="category-icon">
                        ${getCategoryIcon(
                            category
                        )}
                    </span>

                    <span>
                        ${category}
                    </span>

                </div>

                <strong>
                    ${formatMoney(
                        totals[category]
                    )}
                </strong>

            `;


            categorySummary.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   PIE / DOUGHNUT CHART
========================================================= */

function updateChart() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const expenses =
        getMonthExpenses();

    const totals = {};


    expenses.forEach(
        function (expense) {

            if (
                !totals[expense.category]
            ) {

                totals[expense.category] =
                    0;

            }

            totals[expense.category] +=
                Number(expense.amount);

        }
    );


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    if (chartInstance) {

        chartInstance.destroy();

    }


    if (labels.length === 0) {

        return;

    }


    const colors = [

        "#7657ff",

        "#f34f9d",

        "#3b82f6",

        "#22c55e",

        "#ff9f43",

        "#22c7e8",

        "#ef5350",

        "#f6c945"

    ];


    chartInstance =
        new Chart(
            expenseChart,
            {

                type:
                    "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            data:
                                values,

                            backgroundColor:
                                colors.slice(
                                    0,
                                    labels.length
                                ),

                            borderWidth:
                                4,

                            borderColor:
                                document.body
                                    .classList
                                    .contains(
                                        "dark-mode"
                                    )
                                    ? "#1b172d"
                                    : "#ffffff",

                            hoverOffset:
                                8

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "67%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                padding:
                                    15,

                                usePointStyle:
                                    true,

                                font: {

                                    size:
                                        11

                                }

                            }

                        }

                    },

                    animation: {

                        animateRotate:
                            true,

                        animateScale:
                            true

                    }

                }

            }
        );

}


/* =========================================================
   MONTH CHANGE
========================================================= */

monthSelect.addEventListener(
    "change",
    function () {

        updateDashboard();

    }
);


/* =========================================================
   DARK MODE
========================================================= */

function applyDarkMode() {

    if (appData.darkMode) {

        document.body.classList.add(
            "dark-mode"
        );

        themeBtn.textContent =
            "☀️";

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        themeBtn.textContent =
            "🌙";

    }

}


/* =========================================================
   DARK MODE BUTTON
========================================================= */

themeBtn.addEventListener(
    "click",
    function () {

        appData.darkMode =
            !appData.darkMode;

        saveData();

        applyDarkMode();

        updateChart();

    }
);


/* =========================================================
   CLEAR ALL DATA
========================================================= */

clearDataBtn.addEventListener(
    "click",
    function () {

        const confirmation =
            confirm(
                "This will delete all budgets and expenses from this device. Continue?"
            );


        if (!confirmation) {

            return;

        }


        appData = {

            budgets: {},

            expenses: {},

            darkMode:
                appData.darkMode

        };


        saveData();

        updateDashboard();


        alert(
            "All expense data has been cleared."
        );

    }
);


/* =========================================================
   INITIALIZE APP
========================================================= */

function initializeApp() {

    ensureMonthExists(
        getCurrentMonth()
    );

    applyDarkMode();

    updateDashboard();

}


/* =========================================================
   START
========================================================= */

initializeApp();
