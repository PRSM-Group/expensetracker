
export const categories = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

// Checks whether an expense contains valid information.

export function isValidExpense(expense) {
  if (!expense || typeof expense !== "object") return false;

  const validName =
    typeof expense.name === "string" &&
    expense.name.trim().length > 0;

  const amount = Number(expense.amount);
  const validAmount = Number.isFinite(amount) && amount > 0;

  const validCategory = categories.includes(expense.category);

  const dateParts =
    typeof expense.date === "string"
      ? expense.date.split("-").map(Number)
      : [];

  const [year, month, day] = dateParts;

  const parsedDate = new Date(year, month - 1, day);

  const validDate =
    dateParts.length === 3 &&
    /^\d{4}-\d{2}-\d{2}$/.test(expense.date) &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  return validName && validAmount && validCategory && validDate;
}


// Creates a new expense after validating its information.
export function createExpense(expense, id = Date.now()) {
  if (!isValidExpense(expense)) {
    return null;
  }

  return {
    id,
    name: expense.name.trim(),
    amount: Number(expense.amount),
    category: expense.category,
    date: expense.date,
  };
}

// Updates an existing expense.
export function updateExpense(expenses, id, field, value) {
  const allowedFields = ["name", "amount", "category", "date"];

  if (!allowedFields.includes(field)) {
    return expenses;
  }

  return expenses.map((expense) =>
    expense.id === id ? { ...expense, [field]: value } : expense
  );
}

// Deletes an expense using its ID.
export function deleteExpense(expenses, id) {
  return expenses.filter((expense) => expense.id !== id);
}
