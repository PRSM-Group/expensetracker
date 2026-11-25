import { useState } from "react";
import { initialExpenses } from "./data/expenses";
import {
  categories,
  createExpense,
  updateExpense as updateExpenseList,
  deleteExpense as deleteExpenseFromList,
} from "./expenseUtils";
import "./App.css";

const categoryColors = {
  Food: "#60a5fa",
  Transportation: "#34d399",
  Shopping: "#f472b6",
  Bills: "#fbbf24",
  Entertainment: "#a78bfa",
  Other: "#94a3b8",
};

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Category", value: "category" },
  { label: "Amount: Low to High", value: "amount-asc" },
  { label: "Amount: High to Low", value: "amount-desc" },
];

const categoryOptions = [
  { label: "All", value: "All" },
  ...categories.map((category) => ({ label: category, value: category })),
];

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPeso(amount) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dropdown({ prefix, options, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const current =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="sort-dropdown">
      <button
        type="button"
        className="sort-button"
        onClick={() => setOpen((previous) => !previous)}
      >
        {prefix}: {current.label} ▾
      </button>

      {open && (
        <ul className="sort-menu">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={option.value === current.value ? "selected" : ""}
                onClick={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExpensePieChart({ expenses }) {
  const totalsByCategory = categories
    .map((category) => {
      const total = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      return {
        category,
        total,
        color: categoryColors[category],
      };
    })
    .filter((item) => item.total > 0);

  const grandTotal = totalsByCategory.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const slices = totalsByCategory.reduce((acc, item) => {
    const percent = item.total / grandTotal;
    const prevCumulative =
      acc.length > 0 ? acc[acc.length - 1].nextCumulative : 0;

    acc.push({
      ...item,
      percent,
      cumulativePercent: prevCumulative,
      nextCumulative: prevCumulative + percent,
    });

    return acc;
  }, []);

  return (
    <aside className="chart-card">
      <h2>Overview</h2>

      {grandTotal === 0 ? (
        <p className="empty-chart">No expenses to display.</p>
      ) : (
        <>
          <div className="pie-wrapper">
            <svg viewBox="0 0 200 200" className="pie-svg">
              {slices.map((slice) => {
                const strokeDasharray = `${slice.percent * circumference} ${circumference}`;
                const strokeDashoffset =
                  -slice.cumulativePercent * circumference;

                return (
                  <circle
                    key={slice.category}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="28"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 100 100)"
                  />
                );
              })}
            </svg>

            <div className="pie-center">
              <span>Total</span>
              <strong>{formatPeso(grandTotal)}</strong>
            </div>
          </div>

          <ul className="chart-legend">
            {totalsByCategory.map((item) => {
              const percentage = ((item.total / grandTotal) * 100).toFixed(1);

              return (
                <li key={item.category} className="legend-item">
                  <div className="legend-label">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.category}</span>
                  </div>

                  <div className="legend-values">
                    <span>{formatPeso(item.total)}</span>
                    <small>{percentage}%</small>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}

function EditableCell({ value, type = "text", options, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  function handleSave() {
    if (type === "number") {
      const amount = Number(editedValue);

      if (!Number.isFinite(amount) || amount <= 0) {
        setEditedValue(value);
        setEditing(false);
        return;
      }

      onSave(amount);
    } else {
      if (!String(editedValue).trim()) {
        setEditedValue(value);
        setEditing(false);
        return;
      }

      onSave(type === "text" ? editedValue.trim() : editedValue);
    }

    setEditing(false);
  }

  if (editing) {
    return (
      <td>
        {type === "select" ? (
          <select
            autoFocus
            value={editedValue}
            onChange={(event) => {
              setEditedValue(event.target.value);
              onSave(event.target.value);
              setEditing(false);
            }}
            onBlur={() => setEditing(false)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            autoFocus
            type={type}
            min={type === "number" ? "0.01" : undefined}
            step={type === "number" ? "0.01" : undefined}
            value={editedValue}
            onChange={(event) => setEditedValue(event.target.value)}
            onBlur={handleSave}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
              if (event.key === "Escape") {
                setEditedValue(value);
                setEditing(false);
              }
            }}
          />
        )}
      </td>
    );
  }

  let displayValue = value;

  if (type === "number") displayValue = formatPeso(value);
  if (type === "date") displayValue = formatDate(value);

  return (
    <td
      className="editable-cell"
      onClick={() => {
        setEditedValue(value);
        setEditing(true);
      }}
      title="Click to edit"
    >
      {displayValue}
    </td>
  );
}

function App() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Food",
    date: getToday(),
  });

  const [sortKey, setSortKey] = useState("default");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newExpense = createExpense(formData);

    if (!newExpense) {
      return;
    }

    setExpenses((previousExpenses) => [newExpense, ...previousExpenses]);

    setFormData({
      name: "",
      amount: "",
      category: "Food",
      date: getToday(),
    });

    setShowForm(false);
  }

  function updateExpense(id, field, value) {
    setExpenses((previousExpenses) =>
      updateExpenseList(previousExpenses, id, field, value),
    );
  }

  function handleDeleteExpense(id) {
    setExpenses((currentExpenses) =>
      deleteExpenseFromList(currentExpenses, id),
    );
  }

  const dateOptions = [
    { label: "All", value: "All" },
    ...[...new Set(expenses.map((expense) => expense.date))]
      .sort()
      .map((date) => ({ label: formatDate(date), value: date })),
  ];

  // If the selected date no longer exists (edited or deleted), fall back to All
  const activeDateFilter = dateOptions.some(
    (option) => option.value === dateFilter,
  )
    ? dateFilter
    : "All";

  const filteredExpenses = expenses.filter(
    (expense) =>
      (categoryFilter === "All" || expense.category === categoryFilter) &&
      (activeDateFilter === "All" || expense.date === activeDateFilter),
  );

  const displayedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortKey === "category") {
      return categories.indexOf(a.category) - categories.indexOf(b.category);
    }

    if (sortKey === "amount-asc") return a.amount - b.amount;
    if (sortKey === "amount-desc") return b.amount - a.amount;

    return 0;
  });

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Track and manage your expenses.</p>
        </div>

        <button className="add-button" onClick={() => setShowForm(true)}>
          Add Expense
        </button>
      </header>
      <div className="dashboard-grid">
        <section className="expenses">
          <div className="section-header">
            <h2>Expenses</h2>

            <div className="toolbar">
              <Dropdown
                prefix="Filter category"
                options={categoryOptions}
                value={categoryFilter}
                onSelect={setCategoryFilter}
              />

              <Dropdown
                prefix="Filter date"
                options={dateOptions}
                value={activeDateFilter}
                onSelect={setDateFilter}
              />

              <Dropdown
                prefix="Sort by"
                options={sortOptions}
                value={sortKey}
                onSelect={setSortKey}
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {displayedExpenses.length === 0 && (
                  <tr>
                    <td colSpan="5">No expenses match the selected filters.</td>
                  </tr>
                )}

                {displayedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <EditableCell
                      value={expense.name}
                      onSave={(value) =>
                        updateExpense(expense.id, "name", value)
                      }
                    />

                    <EditableCell
                      value={expense.amount}
                      type="number"
                      onSave={(value) =>
                        updateExpense(expense.id, "amount", value)
                      }
                    />

                    <EditableCell
                      value={expense.category}
                      type="select"
                      options={categories}
                      onSave={(value) =>
                        updateExpense(expense.id, "category", value)
                      }
                    />

                    <EditableCell
                      value={expense.date}
                      type="date"
                      onSave={(value) =>
                        updateExpense(expense.id, "date", value)
                      }
                    />

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ExpensePieChart expenses={expenses} />
      </div>

      {showForm && (
        <div className="modal-overlay">
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>Add Expense</h2>

              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Lunch"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-button">
              Save Expense
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;
