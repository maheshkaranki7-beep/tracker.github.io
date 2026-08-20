const STORAGE_KEY = "santhi-expense-app-v2";

const icons = {
  Food: "🍲",
  Groceries: "🛒",
  Bills: "🧾",
  Transport: "🚗",
  Medical: "💊",
  Shopping: "🛍️",
  Home: "🏠",
  Other: "✨"
};

const categoryColors = [
  "#7c3aed",
  "#ec4899",
  "#2563eb",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#eab308"
];

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  budget: 0,
  month: new Date().getMonth(),
  expenses: [],
  dark: false
};

let selectedCategory = "Food";
let chart = null;

const budgetInput = document.getElementById("budgetInput");
const monthSelect = document.getElementById("monthSelect");
const amountInput = document.getElementById("amountInput");
const noteInput = document.getElementById("noteInput");
const expenseForm = document.getElementById("expenseForm");

const totalSpent = document.getElementById("totalSpent");
const remaining = document.getElementById("remaining");
const expenseCount = document.getElementById("expenseCount");

const budgetStatus = document.getElementById("budgetStatus");
const budgetPercent = document.getElementById("budgetPercent");
const budgetProgress = document.getElementById("budgetProgress");

const categoryList = document.getElementById("categoryList");
const expenseList = document.getElementById("expenseList");
const chartEmpty = document.getElementById("chartEmpty");

const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearBtn");


// SAVE EVERYTHING
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


// MONEY FORMAT
function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}


// CURRENT MONTH EXPENSES
function getMonthExpenses() {
  return data.expenses.filter(expense => {
    return expense.month === Number(data.month);
  });
}


// UPDATE BUDGET IMMEDIATELY
budgetInput.value = data.budget || "";

budgetInput.addEventListener("input", () => {

  data.budget = Number(budgetInput.value) || 0;

  save();

  updateAll();
});


// CHANGE MONTH IMMEDIATELY
monthSelect.value = data.month;

monthSelect.addEventListener("change", () => {

  data.month = Number(monthSelect.value);

  save();

  updateAll();
});


// CATEGORY BUTTONS
document.querySelectorAll(".category").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".category")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");

    selectedCategory =
      button.dataset.category;
  });
});


// ADD EXPENSE
expenseForm.addEventListener("submit", event => {

  event.preventDefault();

  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    amountInput.focus();
    return;
  }

  const expense = {
    id: Date.now(),
    amount,
    category: selectedCategory,
    note: noteInput.value.trim(),
    month: Number(data.month),
    date: new Date().toISOString()
  };

  data.expenses.unshift(expense);

  save();

  amountInput.value = "";
  noteInput.value = "";

  updateAll();

  amountInput.focus();
});


// DELETE
function deleteExpense(id) {

  data.expenses =
    data.expenses.filter(
      expense => expense.id !== id
    );

  save();

  updateAll();
}


// CLEAR
clearBtn.addEventListener("click", () => {

  const expenses = getMonthExpenses();

  if (!expenses.length) {
    return;
  }

  if (
    confirm(
      "Delete all expenses for this month?"
    )
  ) {

    data.expenses =
      data.expenses.filter(
        expense =>
          expense.month !== Number(data.month)
      );

    save();

    updateAll();
  }
});


// UPDATE DASHBOARD
function updateDashboard() {

  const expenses = getMonthExpenses();

  const spent =
    expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );

  const budget =
    Number(data.budget) || 0;

  const left =
    budget - spent;

  totalSpent.textContent =
    money(spent);

  remaining.textContent =
    money(Math.max(left, 0));

  expenseCount.textContent =
    expenses.length;


  // BUDGET %
  let percent = 0;

  if (budget > 0) {
    percent =
      Math.round((spent / budget) * 100);
  }

  budgetPercent.textContent =
    percent + "%";

  if (budget === 0) {

    budgetStatus.textContent =
      "Set your monthly budget";

  } else if (left >= 0) {

    budgetStatus.textContent =
      money(left) + " remaining";

  } else {

    budgetStatus.textContent =
      money(Math.abs(left)) + " over budget";
  }


  budgetProgress.style.width =
    Math.min(percent, 100) + "%";


  if (percent >= 100) {

    budgetProgress.style.background =
      "linear-gradient(90deg,#ef4444,#f97316)";

  } else if (percent >= 75) {

    budgetProgress.style.background =
      "linear-gradient(90deg,#f97316,#eab308)";

  } else {

    budgetProgress.style.background =
      "linear-gradient(90deg,#7c3aed,#ec4899)";
  }
}


// CATEGORY BREAKDOWN
function updateCategories() {

  const expenses = getMonthExpenses();

  const totals = {};

  expenses.forEach(expense => {

    totals[expense.category] =
      (totals[expense.category] || 0) +
      Number(expense.amount);
  });


  categoryList.innerHTML = "";

  const categories =
    Object.keys(totals)
      .sort((a, b) =>
        totals[b] - totals[a]
      );


  if (!categories.length) {

    categoryList.innerHTML =
      `<div class="empty-small">
        No expenses yet
      </div>`;

    return;
  }


  categories.forEach(category => {

    const row =
      document.createElement("div");

    row.className =
      "category-total";

    row.innerHTML = `
      <div class="category-total-left">
        <span>${icons[category] || "✨"}</span>
        <span>${category}</span>
      </div>

      <strong>
        ${money(totals[category])}
      </strong>
    `;

    categoryList.appendChild(row);
  });
}


// EXPENSE HISTORY
function updateHistory() {

  const expenses = getMonthExpenses();

  expenseList.innerHTML = "";

  if (!expenses.length) {

    expenseList.innerHTML = `
      <div class="empty-history">
        <div>🌱</div>
        <h3>No expenses yet</h3>
        <p>Add your first expense above.</p>
      </div>
    `;

    return;
  }


  expenses.forEach(expense => {

    const row =
      document.createElement("div");

    row.className =
      "expense-row";

    const date =
      new Date(expense.date);

    const dateText =
      date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short"
        }
      );

    const description =
      expense.note ||
      expense.category;


    row.innerHTML = `
      <div class="expense-left">

        <div class="expense-icon">
          ${icons[expense.category] || "✨"}
        </div>

        <div>
          <div class="expense-name">
            ${escapeHTML(description)}
          </div>

          <div class="expense-meta">
            ${expense.category} • ${dateText}
          </div>
        </div>

      </div>

      <div class="expense-right">

        <span class="expense-amount">
          ${money(expense.amount)}
        </span>

        <button
          class="delete-expense"
          onclick="deleteExpense(${expense.id})"
        >
          ×
        </button>

      </div>
    `;

    expenseList.appendChild(row);
  });
}


// CHART
function updateChart() {

  const expenses = getMonthExpenses();

  const totals = {};

  expenses.forEach(expense => {

    totals[expense.category] =
      (totals[expense.category] || 0) +
      Number(expense.amount);
  });


  const labels =
    Object.keys(totals);

  const values =
    Object.values(totals);


  chartEmpty.style.display =
    labels.length ? "none" : "flex";


  if (chart) {
    chart.destroy();
    chart = null;
  }


  if (!labels.length) {
    return;
  }


  const canvas =
    document.getElementById("expenseChart");

  chart =
    new Chart(canvas, {

      type: "doughnut",

      data: {

        labels,

        datasets: [{
          data: values,
          backgroundColor:
            categoryColors.slice(
              0,
              labels.length
            ),
          borderWidth: 0,
          hoverOffset: 7
        }]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "68%",

        plugins: {

          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },

          tooltip: {

            callbacks: {

              label: context => {
                return (
                  " " +
                  context.label +
                  ": " +
                  money(context.raw)
                );
              }
            }
          }
        }
      }
    });
}


// ESCAPE TEXT
function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value;

  return div.innerHTML;
}


// DARK MODE
themeBtn.addEventListener("click", () => {

  data.dark = !data.dark;

  document.body.classList.toggle(
    "dark",
    data.dark
  );

  themeBtn.textContent =
    data.dark ? "☀️" : "🌙";

  save();
});


// LOAD DARK MODE
if (data.dark) {

  document.body.classList.add("dark");

  themeBtn.textContent = "☀️";
}


// UPDATE EVERYTHING
function updateAll() {

  updateDashboard();

  updateCategories();

  updateHistory();

  updateChart();
}


// INITIAL LOAD
updateAll();
