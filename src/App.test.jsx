import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

describe("ExpenseTracker App", () => {
  // TEST 1: Render the main interface
  it("renders the main application interface", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Expense Tracker" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Expenses" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Expense" }),
    ).toBeInTheDocument();
  });

  // TEST 2: Open the add expense form
  it("opens the add expense form", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Save Expense" }),
    ).toBeInTheDocument();
  });

  // TEST 3: Close the add expense form
  it("closes the add expense form", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));

    fireEvent.click(screen.getByRole("button", { name: "×" }));

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  // TEST 4: Add a new expense
  it("adds a new expense to the table", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test Lunch" },
    });

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "150" },
    });

    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-11-27" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Expense" }));

    expect(screen.getByText("Test Lunch")).toBeInTheDocument();
    expect(screen.getByText("₱150.00")).toBeInTheDocument();
  });

  // TEST 5: Delete an existing expense
  it("deletes an existing expense from the table", () => {
    render(<App />);

    const expenseName = screen.getByText("Lunch");

    expect(expenseName).toBeInTheDocument();

    const expenseRow = expenseName.closest("tr");

    const deleteButton = within(expenseRow).getByRole("button", {
      name: "Delete",
    });

    fireEvent.click(deleteButton);

    expect(screen.queryByText("Lunch")).not.toBeInTheDocument();
  });

  // TEST 6: Edit an existing expense
  it("edits an existing expense name", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Lunch"));

    const editInput = screen.getByDisplayValue("Lunch");

    fireEvent.change(editInput, {
      target: { value: "Updated Lunch" },
    });

    fireEvent.keyDown(editInput, { key: "Enter" });

    expect(screen.getByText("Updated Lunch")).toBeInTheDocument();

    expect(screen.queryByText("Lunch")).not.toBeInTheDocument();
  });

  // TEST 7: Cancel an edit
  it("cancels an edit when Escape is pressed", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Lunch"));

    const editInput = screen.getByDisplayValue("Lunch");

    fireEvent.change(editInput, {
      target: { value: "Changed Name" },
    });

    fireEvent.keyDown(editInput, { key: "Escape" });

    expect(screen.getByText("Lunch")).toBeInTheDocument();

    expect(screen.queryByText("Changed Name")).not.toBeInTheDocument();
  });

  // TEST 8: Filter expenses by category
  it("filters expenses by category", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Bills Test" },
    });

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "500" },
    });

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Bills" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Expense" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Filter category: All ▾",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Bills" }));

    expect(screen.getByText("Bills Test")).toBeInTheDocument();
    expect(screen.queryByText("Lunch")).not.toBeInTheDocument();
  });

  // TEST 9: Sort expenses by amount
  it("sorts expenses from lowest to highest amount", () => {
    render(<App />);

    function addExpense(name, amount) {
      fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));

      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: name },
      });

      fireEvent.change(screen.getByLabelText("Amount"), {
        target: { value: String(amount) },
      });

      fireEvent.change(screen.getByLabelText("Category"), {
        target: { value: "Bills" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Save Expense" }));
    }

    addExpense("Low Amount Test", 10);
    addExpense("High Amount Test", 900);

    // Filter to Bills so only the two test expenses remain.
    fireEvent.click(
      screen.getByRole("button", {
        name: "Filter category: All ▾",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Bills" }));

    // Select ascending amount order.
    fireEvent.click(
      screen.getByRole("button", {
        name: "Sort by: Default ▾",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Amount: Low to High",
      }),
    );

    const expenseRows = screen.getAllByRole("row").slice(1);

    const rowNames = expenseRows.map((row) => row.textContent);

    const lowIndex = rowNames.findIndex((name) =>
      name.includes("Low Amount Test"),
    );

    const highIndex = rowNames.findIndex((name) =>
      name.includes("High Amount Test"),
    );

    expect(lowIndex).toBeGreaterThanOrEqual(0);
    expect(highIndex).toBeGreaterThanOrEqual(0);
    expect(lowIndex).toBeLessThan(highIndex);
  });

  // TEST 10: Display the expense overview
  it("displays the expense overview chart", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
  });
});
