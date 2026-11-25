import { useState } from "react";
import { initialExpenses } from "./data/expenses";
import "./App.css";

const categories = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

const categoryColors = {
  Food: "#60a5fa",
  Transportation: "#34d399",
  Shopping: "#f472b6",
  Bills: "#fbbf24",
  Entertainment: "#a78bfa",
  Other: "#94a3b8",
};

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
      if (!editedValue.trim()) {
        setEditedValue(value);
        setEditing(false);
        return;
      }

      onSave(editedValue);
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

  if (type === "number") {
    displayValue = `₱${Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (type === "date") {
    displayValue = new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newExpense = {
      id: Date.now(),
      name: formData.name.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
    };

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
      previousExpenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense,
      ),
    );
  }

  const deleteExpense = (id) => {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
  };

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
          <h2>Expenses</h2>

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
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <EditableCell
                    value={expense.name}
                    onSave={(value) => updateExpense(expense.id, "name", value)}
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
                    onSave={(value) => updateExpense(expense.id, "date", value)}
                  />
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
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
                        onClick={() => deleteExpense(expense.id)}
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
