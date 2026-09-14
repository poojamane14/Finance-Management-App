import { useState, useEffect } from "react";

function VaryingExpenses() {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [varyingExpenses, setExpenses] = useState([]);
  const [varyingBudget, setBudget] = useState("");

  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load varying expenses and varying budget
  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      return;
    }

    // Load varying expenses from MySQL
    fetch(
      `http://127.0.0.1:5000/api/varying-expenses/${currentUser.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Varying expenses:", data);

        if (Array.isArray(data)) {
          const formattedExpenses = data.map((expense) => ({
            id: expense.id,
            name: expense.merchant,
            amount: expense.amount,
            createdAt: expense.transaction_date,
          }));

          setExpenses(formattedExpenses);
        }
      })
      .catch((error) => {
        console.error("Error loading varying expenses:", error);
      });

    // Load varying budget from MySQL
    // Load varying budget for the current month
const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

fetch(
  `http://127.0.0.1:5000/api/monthly-budget/${currentUser.id}/${currentYear}/${currentMonth}`
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Monthly budget:", data);

    if (data.varying_budget !== undefined) {
      setBudget(data.varying_budget);
    }

    setProfileLoaded(true);
  })
  .catch((error) => {
    console.error("Error loading monthly budget:", error);
    setProfileLoaded(true);
  });
},[]);

  // Save varying budget to MySQL
  useEffect(() => {
    if (!profileLoaded) {
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      return;
    }

    fetch(
      "http://127.0.0.1:5000/api/financial-profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          varying_budget: varyingBudget,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Varying budget saved:", data);
      })
      .catch((error) => {
        console.error("Error saving varying budget:", error);
      });
  }, [varyingBudget, profileLoaded]);

  // Save varying budget for the current month
const saveMonthlyVaryingBudget = async (budgetAmount) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  const now = new Date();

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/monthly-budget",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,

          // JavaScript months are 0-11,
          // database months are 1-12
          month: now.getMonth() + 1,
          year: now.getFullYear(),

          varying_budget: budgetAmount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Monthly varying budget save error:", data.error);
      return;
    }

    console.log("Monthly varying budget saved:", data);
  } catch (error) {
    console.error(
      "Error saving monthly varying budget:",
      error
    );
  }
};

  // Add expense
  const addExpense = async () => {
    if (expenseName === "" || expenseAmount === "") {
      alert("Please fill all fields");
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/varying-expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            amount: Number(expenseAmount),
            merchant: expenseName,
            description: "Varying expense",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Expense added:", data);

        // Reload expenses from MySQL
        const expenseResponse = await fetch(
          `http://127.0.0.1:5000/api/varying-expenses/${currentUser.id}`
        );

        const expenseData = await expenseResponse.json();

        const formattedExpenses = expenseData.map((expense) => ({
          id: expense.id,
          name: expense.merchant,
          amount: expense.amount,
          createdAt: expense.transaction_date,
        }));

        setExpenses(formattedExpenses);

        setExpenseName("");
        setExpenseAmount("");

        alert("Varying expense added successfully!");
      } else {
        alert(data.error || "Failed to add expense.");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Unable to connect to server.");
    }
  };

  // Delete expense
  const deleteExpense = async (transactionId) => {
    console.log("DELETE CLICKED:", transactionId);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/varying-expenses/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Expense deleted:", data);

        setExpenses((prevExpenses) =>
          prevExpenses.filter(
            (expense) => expense.id !== transactionId
          )
        );
      } else {
        alert(data.error || "Failed to delete expense.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Unable to connect to server.");
    }
  };

  const totalVaryingSpent = varyingExpenses.reduce(
    (total, varyingExpense) =>
      total + Number(varyingExpense.amount),
    0
  );

  const remainingBalance =
    Number(varyingBudget || 0) - totalVaryingSpent;

  return (
    <div className="p-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">
        Varying Expenses
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-md">

        <h2 className="text-xl font-bold mb-4">
          Set Varying Expense Budget
        </h2>

        <input
          type="number"
          placeholder="Enter Budget Amount"
          value={varyingBudget}
          onChange={(e) => {const value = Number(e.target.value);
          setBudget(value);
          saveMonthlyVaryingBudget(value);
          }}
          className="border p-3 rounded-lg outline-none w-full"
        />

      </div>

      <div className="flex gap-6 flex-wrap mb-8">

        {/* Budget Card */}
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Total Varying Budget
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {varyingBudget}
          </h1>

        </div>

        {/* Spent Card */}
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Total Varying Spent
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {totalVaryingSpent}
          </h1>

        </div>

        {/* Remaining Card */}
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Remaining Varying Balance
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {remainingBalance}
          </h1>

        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div className="flex gap-8 items-start flex-wrap">

        {/* LEFT SIDE - FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl flex-1 h-[400px] flex flex-col">

          <h2 className="text-xl font-bold mb-4">
            Add Expense
          </h2>

          <div className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Enter Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="number"
              placeholder="Enter Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="border p-3 rounded-lg outline-none"
            />

            <button
              onClick={addExpense}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Add Expense
            </button>

          </div>

        </div>

        {/* RIGHT SIDE - EXPENSE LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl flex-1 h-[420px] flex flex-col min-h-0">

          <h2 className="text-2xl font-bold mb-5">
            Expense List
          </h2>

          {varyingExpenses.length === 0 ? (
            <p className="text-gray-500">
              No expenses added yet.
            </p>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 min-h-0">

              {varyingExpenses.map((varyingExpense) => (

                <div
                  key={varyingExpense.id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                >

                  <div>

                    <h3 className="font-medium">
                      {varyingExpense.name}
                    </h3>

                    <p className="text-sm text-gray-500">

                      {varyingExpense.createdAt &&
                        `📅 ${new Date(
                          varyingExpense.createdAt
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}

                      `}

                    </p>

                  </div>

                  <div className="flex items-center gap-4">

                    <h3 className="font-semibold">
                      ₹ {varyingExpense.amount}
                    </h3>

                    <button
                      onClick={() =>
                        deleteExpense(varyingExpense.id)
                      }
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      🗑
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

          {/* TOTAL */}
          <div className="mt-6 text-xl font-bold">
            Total Expenses: ₹ {totalVaryingSpent}
          </div>

        </div>

      </div>

    </div>
  );
}

export default VaryingExpenses;