const KEY = "santhi-expenses-final";

const categoryIcons = {
  Food: "🍲",
  Groceries: "🛒",
  Bills: "🧾",
  Travel: "🚗",
  Medical: "💊",
  Shopping: "🛍️",
  Home: "🏠",
  Other: "✨"
};

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


let state =
  JSON.parse(localStorage.getItem(KEY)) || {
    budgets: {},
    expenses: [],
    dark: false
  };


let selectedMonth =
  new Date().getMonth();

let selectedCategory = "Food";

let temporaryAmount = 0;

let chart = null;


const monthSelect =
  document.getElementById("monthSelect");

const selectedMonthTitle =
  document.getElementById("selectedMonthTitle");

const budgetInput =
  document.getElementById("budgetInput");

const budgetSaveBtn =
  document.getElementById("budgetSaveBtn");

const amountInput =
  document.getElementById("amountInput");

const amountOkBtn =
  document.getElementById("amountOkBtn");

const noteInput =
  document.getElementById("noteInput");

const saveExpenseBtn =
  document.getElementById("saveExpenseBtn");

const enteredDetails =
  document.getElementById("enteredDetails");

const budgetText =
  document.getElementById("budgetText");

const spentText =
  document.getElementById("spentText");

const remainingText =
  document.getElementById("remainingText");

const totalSpent =
  document.getElementById("totalSpent");

const transactionCount =
  document.getElementById("transactionCount");

const averageSpent =
  document.getElementById("averageSpent");

const budgetMessage =
  document.getElementById("budgetMessage");

const progressBar =
  document.getElementById("progressBar");

const expenseList =
  document.getElementById("expenseList");

const categoryTotals =
  document.getElementById("categoryTotals");

const chartEmpty =
  document.getElementById("chartEmpty");

const themeBtn =
  document.getElementById("themeBtn");

const clearBtn =
  document.getElementById("clearBtn");


// -------------------------
// SAVE
// -------------------------

function saveData() {

  localStorage.setItem(
    KEY,
    JSON.stringify(state)
  );
}


// -------------------------
// MONEY
// -------------------------

function money(number) {

  return "₹" +
    Number(number || 0)
      .toLocaleString("en-IN", {
        maximumFractionDigits: 2
      });
}


// -------------------------
// MONTH SELECT
// -------------------------

months.forEach((month, index) => {

  const option =
    document.createElement("option");

  option.value = index;

  option.textContent = month;

  monthSelect.appendChild(option);
});


monthSelect.value =
  selectedMonth;


// -------------------------
// GET CURRENT EXPENSES
// -------------------------

function currentExpenses() {

  return state.expenses.filter(
    expense =>
      expense.month === selectedMonth
  );
}


// -------------------------
// UPDATE MONTH TITLE
// -------------------------

function updateMonthTitle() {

  selectedMonthTitle.textContent =
    months[selectedMonth] +
    " " +
    new Date().getFullYear();
}


// -------------------------
// BUDGET
// -------------------------

function updateBudgetUI() {

  const budget =
    Number(
      state.budgets[selectedMonth] || 0
    );

  const expenses =
    currentExpenses();

  const spent =
    expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

  const remaining =
    budget - spent;


  budgetText.textContent =
    money(budget);

  spentText.textContent =
    money(spent);

  remainingText.textContent =
    money(Math.max(remaining, 0));


  let percent = 0;

  if (budget > 0) {

    percent =
      Math.round(
        (spent / budget) * 100
      );
  }


  progressBar.style.width =
    Math.min(percent, 100) + "%";


  if (budget === 0) {

    budgetMessage.textContent =
      "Set your monthly budget";

  } else if (remaining >= 0) {

    budgetMessage.textContent =
      money(remaining) +
      " remaining";

  } else {

    budgetMessage.textContent =
      money(Math.abs(remaining)) +
      " over budget";
  }


  if (percent >= 100) {

    progressBar.style.background =
      "linear-gradient(90deg,#ef4444,#f97316)";

  } else if (percent >= 75) {

    progressBar.style.background =
      "linear-gradient(90deg,#f97316,#eab308)";

  } else {

    progressBar.style.background =
      "linear-gradient(90deg,#7c3aed,#ec4899)";
  }


  budgetInput.value =
    budget || "";
}


// -------------------------
// BUDGET OK
// -------------------------

budgetSaveBtn.addEventListener(
  "click",
  () => {

    const value =
      Number(budgetInput.value);

    if (value <= 0) {

      budgetInput.focus();

      return;
    }


    state.budgets[selectedMonth] =
      value;

    saveData();

    updateAll();

    budgetSaveBtn.textContent =
      "Saved ✓";

    setTimeout(() => {

      budgetSaveBtn.textContent =
        "OK ✓";

    }, 1000);
  }
);


// -------------------------
// MONTH CHANGE
// -------------------------

monthSelect.addEventListener(
  "change",
  () => {

    selectedMonth =
      Number(monthSelect.value);

    temporaryAmount = 0;

    amountInput.value = "";

    updateAll();

    updateEnteredDetails();
  }
);


// -------------------------
// CATEGORY
// -------------------------

document
  .querySelectorAll(".category")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".category")
          .forEach(item =>
            item.classList.remove("active")
          );

        button.classList.add("active");

        selectedCategory =
          button.dataset.category;

        updateEnteredDetails();
      }
    );
  });


// -------------------------
// AMOUNT OK
// -------------------------

amountOkBtn.addEventListener(
  "click",
  () => {

    const amount =
      Number(amountInput.value);

    if (!amount || amount <= 0) {

      amountInput.focus();

      return;
    }


    temporaryAmount =
      amount;

    updateEnteredDetails();

    amountOkBtn.textContent =
      "Added ✓";

    setTimeout(() => {

      amountOkBtn.textContent =
        "OK ✓";

    }, 700);
  }
);


// -------------------------
// ENTERED DETAILS PREVIEW
// -------------------------

function updateEnteredDetails() {

  if (!temporaryAmount) {

    enteredDetails.innerHTML = `
      <div class="detail-placeholder">
        Enter an amount above
      </div>
    `;

    return;
  }


  enteredDetails.innerHTML = `

    <div class="detail-preview">

      <div class="preview-left">

        <div class="preview-icon">
          ${categoryIcons[selectedCategory]}
        </div>

        <div>

          <div class="preview-name">
            ${noteInput.value.trim() || selectedCategory}
          </div>

          <div class="preview-category">
            ${selectedCategory}
          </div>

        </div>

      </div>

      <div class="preview-amount">
        ${money(temporaryAmount)}
      </div>

    </div>
  `;
}


noteInput.addEventListener(
  "input",
  updateEnteredDetails
);


// -------------------------
// SAVE EXPENSE
// -------------------------

saveExpenseBtn.addEventListener(
  "click",
  () => {

    if (!temporaryAmount) {

      amountInput.focus();

      return;
    }


    state.expenses.unshift({

      id: Date.now(),

      amount:
        Number(temporaryAmount),

      category:
        selectedCategory,

      note:
        noteInput.value.trim(),

      month:
        selectedMonth,

      date:
        new Date().toISOString()
    });


    saveData();


    temporaryAmount = 0;

    amountInput.value = "";

    noteInput.value = "";


    updateEnteredDetails();

    updateAll();


    saveExpenseBtn.textContent =
      "SAVED ✓";

    setTimeout(() => {

      saveExpenseBtn.textContent =
        "SAVE EXPENSE ✓";

    }, 1000);
  }
);


// -------------------------
// DASHBOARD
// -------------------------

function updateDashboard() {

  const expenses =
    currentExpenses();

  const spent =
    expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );


  totalSpent.textContent =
    money(spent);

  transactionCount.textContent =
    expenses.length;

  averageSpent.textContent =
    money(
      expenses.length
        ? spent / expenses.length
        : 0
    );
}


// -------------------------
// HISTORY
// -------------------------

function updateHistory() {

  const expenses =
    currentExpenses();

  expenseList.innerHTML = "";


  if (!expenses.length) {

    expenseList.innerHTML = `

      <div class="empty-history">

        <div>🌱</div>

        <h3>No expenses yet</h3>

        <p>
          Add your first expense above.
        </p>

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
      new Date(expense.date)
        .toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short"
          }
        );


    row.innerHTML = `

      <div class="expense-left">

        <div class="expense-icon">
          ${categoryIcons[expense.category]}
        </div>

        <div>

          <div class="expense-name">
            ${escapeHTML(
              expense.note ||
              expense.category
            )}
          </div>

          <div class="expense-meta">
            ${expense.category}
            •
            ${date}
          </div>

        </div>

      </div>


      <div class="expense-right">

        <span class="expense-amount">
          ${money(expense.amount)}
        </span>

        <button
          class="delete-btn"
          onclick="deleteExpense(${expense.id})"
        >
          ×
        </button>

      </div>
    `;


    expenseList.appendChild(row);
  });
}


// -------------------------
// DELETE
// -------------------------

function deleteExpense(id) {

  state.expenses =
    state.expenses.filter(
      expense =>
        expense.id !== id
    );

  saveData();

  updateAll();
}


// -------------------------
// CATEGORY TOTALS
// -------------------------

function updateCategoryTotals() {

  const totals = {};

  currentExpenses().forEach(
    expense => {

      totals[expense.category] =
        (totals[expense.category] || 0) +
        Number(expense.amount);
    }
  );


  categoryTotals.innerHTML = "";


  const categories =
    Object.keys(totals)
      .sort(
        (a, b) =>
          totals[b] - totals[a]
      );


  if (!categories.length) {

    categoryTotals.innerHTML = `
      <div class="detail-placeholder">
        No category spending yet
      </div>
    `;

    return;
  }


  categories.forEach(category => {

    const row =
      document.createElement("div");

    row.className =
      "category-total";


    row.innerHTML = `

      <div class="category-left">

        <span>
          ${categoryIcons[category]}
        </span>

        <span>
          ${category}
        </span>

      </div>

      <strong>
        ${money(totals[category])}
      </strong>
    `;


    categoryTotals.appendChild(row);
  });
}


// -------------------------
// CHART
// -------------------------

function updateChart() {

  const totals = {};

  currentExpenses().forEach(
    expense => {

      totals[expense.category] =
        (totals[expense.category] || 0) +
        Number(expense.amount);
    }
  );


  const labels =
    Object.keys(totals);

  const values =
    Object.values(totals);


  if (chart) {

    chart.destroy();

    chart = null;
  }


  chartEmpty.style.display =
    labels.length
      ? "none"
      : "flex";


  if (!labels.length) {

    return;
  }


  chart =
    new Chart(
      document.getElementById(
        "expenseChart"
      ),
      {

        type: "doughnut",

        data: {

          labels,

          datasets: [{

            data: values,

            backgroundColor: [
              "#7c3aed",
              "#ec4899",
              "#2563eb",
              "#06b6d4",
              "#10b981",
              "#f97316",
              "#ef4444",
              "#eab308"
            ],

            borderWidth: 0,

            hoverOffset: 8
          }]
        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: "65%",

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

                label: context =>

                  " " +
                  context.label +
                  ": " +
                  money(context.raw)
              }
            }
          }
        }
      }
    );
}


// -------------------------
// CLEAR MONTH
// -------------------------

clearBtn.addEventListener(
  "click",
  () => {

    const hasExpenses =
      currentExpenses().length > 0;

    if (!hasExpenses) {
      return;
    }


    if (
      confirm(
        "Clear all expenses for this month?"
      )
    ) {

      state.expenses =
        state.expenses.filter(
          expense =>
            expense.month !==
            selectedMonth
        );

      saveData();

      updateAll();
    }
  }
);


// -------------------------
// DARK MODE
// -------------------------

themeBtn.addEventListener(
  "click",
  () => {

    state.dark =
      !state.dark;

    document.body.classList.toggle(
      "dark",
      state.dark
    );

    themeBtn.textContent =
      state.dark
        ? "☀️"
        : "🌙";

    saveData();
  }
);


if (state.dark) {

  document.body.classList.add("dark");

  themeBtn.textContent = "☀️";
}


// -------------------------
// ESCAPE HTML
// -------------------------

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value;

  return div.innerHTML;
}


// -------------------------
// UPDATE EVERYTHING
// -------------------------

function updateAll() {

  updateMonthTitle();

  updateBudgetUI();

  updateDashboard();

  updateHistory();

  updateCategoryTotals();

  updateChart();
}


// -------------------------
// START
// -------------------------

updateAll();
updateEnteredDetails();
