import { describe, it, expect } from "vitest";

import {
  isValidExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  filterExpenses,
  sortExpenses,
  getCategoryTotals,
} from "./expenseUtils";

describe("Expense Management Tests", () => {
  const validExpense = {
    name: "Groceries",
    amount: 500,
    category: "Food",
    date: "2026-11-25",
  };

  // TEST 1: Valid expense input
  it("should create an expense with valid information", () => {
    const result = createExpense(validExpense, 1);

    expect(result).toEqual({
      id: 1,
      name: "Groceries",
      amount: 500,
      category: "Food",
      date: "2026-11-25",
    });
  });

  // TEST 2: Alternative outcome - trim whitespace
  it("should remove unnecessary spaces from an expense name", () => {
    const result = createExpense({ ...validExpense, name: "  Groceries  " }, 2);

    expect(result.name).toBe("Groceries");
  });

  // TEST 3: Invalid input - negative amount
  it("should reject an expense with a negative amount", () => {
    const result = createExpense({ ...validExpense, amount: -100 }, 3);

    expect(result).toBeNull();
  });

  // TEST 4: Invalid empty name
  it("should reject an expense with an empty name", () => {
    expect(isValidExpense({ ...validExpense, name: "   " })).toBe(false);
  });

  // TEST 5: Update an existing expense
  it("should update the selected expense", () => {
    const expenses = [
      { id: 1, ...validExpense },
      { id: 2, ...validExpense, name: "Coffee" },
    ];

    const result = updateExpense(expenses, 1, "name", "Lunch");

    expect(result[0].name).toBe("Lunch");
    expect(result[1].name).toBe("Coffee");
  });

  // TEST 6: Delete an existing expense
  it("should delete the selected expense", () => {
    const expenses = [
      { id: 1, ...validExpense },
      { id: 2, ...validExpense, name: "Coffee" },
    ];

    const result = deleteExpense(expenses, 1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});

describe("filterExpenses", () => {
  const expenses = [
    { id: 1, name: "Lunch", amount: 150, category: "Food", date: "2026-11-27" },
    {
      id: 2,
      name: "Bus",
      amount: 50,
      category: "Transportation",
      date: "2026-11-27",
    },
    {
      id: 3,
      name: "Groceries",
      amount: 300,
      category: "Food",
      date: "2026-11-26",
    },
  ];

  it("filters expenses by category", () => {
    const result = filterExpenses(expenses, "Food");

    expect(result).toHaveLength(2);
    expect(result.every((expense) => expense.category === "Food")).toBe(true);
  });

  it("filters expenses by date", () => {
    const result = filterExpenses(expenses, "All", "2026-11-27");

    expect(result).toHaveLength(2);
  });

  it("returns all expenses when no filters are selected", () => {
    expect(filterExpenses(expenses)).toHaveLength(3);
  });
});

describe("sortExpenses", () => {
  const expenses = [
    { id: 1, name: "Lunch", amount: 150, category: "Food" },
    { id: 2, name: "Bus", amount: 50, category: "Transportation" },
    { id: 3, name: "Groceries", amount: 300, category: "Food" },
  ];

  it("sorts expenses from lowest to highest amount", () => {
    const result = sortExpenses(expenses, "amount-asc");

    expect(result.map((expense) => expense.amount)).toEqual([50, 150, 300]);
  });

  it("sorts expenses from highest to lowest amount", () => {
    const result = sortExpenses(expenses, "amount-desc");

    expect(result.map((expense) => expense.amount)).toEqual([300, 150, 50]);
  });

  it("does not modify the original expenses array", () => {
    sortExpenses(expenses, "amount-desc");

    expect(expenses.map((expense) => expense.amount)).toEqual([150, 50, 300]);
  });
});

describe("getCategoryTotals", () => {
  it("calculates totals for each category and excludes empty categories", () => {
    const expenses = [
      { id: 1, amount: 100, category: "Food" },
      { id: 2, amount: 200, category: "Food" },
      { id: 3, amount: 50, category: "Transportation" },
    ];

    expect(getCategoryTotals(expenses)).toEqual([
      { category: "Food", total: 300 },
      { category: "Transportation", total: 50 },
    ]);
  });

  it("returns an empty array when there are no expenses", () => {
    expect(getCategoryTotals([])).toEqual([]);
  });
});
