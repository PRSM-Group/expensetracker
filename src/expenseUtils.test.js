
import { describe, it, expect } from "vitest";

import {
  isValidExpense,
  createExpense,
  updateExpense,
  deleteExpense,
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
    const result = createExpense(
      { ...validExpense, name: "  Groceries  " },
      2
    );

    expect(result.name).toBe("Groceries");
  });

  // TEST 3: Invalid input - negative amount
  it("should reject an expense with a negative amount", () => {
    const result = createExpense(
      { ...validExpense, amount: -100 },
      3
    );

    expect(result).toBeNull();
  });

  // TEST 4: Invalid empty name
  it("should reject an expense with an empty name", () => {
    expect(
      isValidExpense({ ...validExpense, name: "   " })
    ).toBe(false);
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
