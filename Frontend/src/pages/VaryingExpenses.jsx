import { useState, useEffect } from "react";

function VaryingExpenses() {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [varyingExpenses, setExpenses] = useState([]);
  const [varyingBudget, setBudget] = useState("");

  useEffect(() => {
  const savedExpenses = localStorage.getItem("varyingExpenses");

  if (savedExpenses) {
    setExpenses(JSON.parse(savedExpenses));
  }
}, []);

useEffect(() => {
  const savedBudget = localStorage.getItem("varyingBudget");

  if (savedBudget) {
    setBudget(JSON.parse(savedBudget));
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    "varyingBudget",
    JSON.stringify(varyingBudget)
  );
}, [varyingBudget]);

 useEffect(() => {
  localStorage.setItem(
    "varyingExpenses",
    JSON.stringify(varyingExpenses)
  );
}, [varyingExpenses]);

  const addExpense = () => {
    if (expenseName === "" || expenseAmount === "") {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      name: expenseName,
      amount: Number(expenseAmount),
    };
 setExpenses([...varyingExpenses, newExpense]);

  setExpenseName("");
  setExpenseAmount("");
};

const deleteExpense = (indexToDelete) => {
  console.log("DELETE CLICKED:", indexToDelete);

  setExpenses((prevExpenses) =>
    prevExpenses.filter((_, index) => index !== indexToDelete)
  );
};

  const totalExpenses = varyingExpenses.reduce(
    (total, varyingExpense) => total + varyingExpense.amount,
    0
  );

  const remainingBalance = varyingBudget - totalExpenses;

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
    onChange={(e) => setBudget(Number(e.target.value))}
    className="border p-3 rounded-lg outline-none w-full"
  />

</div>

<div className="flex gap-6 flex-wrap mb-8">

  {/* Budget Card */}
  <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Total Budget</h2>

    <h1 className="text-3xl font-bold mt-3">
      ₹ {varyingBudget}
    </h1>
  </div>

  {/* Spent Card */}
  <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Total Spent</h2>

    <h1 className="text-3xl font-bold mt-3">
      ₹ {totalExpenses}
    </h1>
  </div>

  {/* Remaining Card */}
  <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Remaining Balance</h2>

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

              {varyingExpenses.map((varyingExpense, index) => (
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">

  <div>
    <h3 className="font-medium">{varyingExpense.name}</h3>
  </div>

  <div className="flex items-center gap-4">

    <h3 className="font-semibold">₹ {varyingExpense.amount}</h3>

    <button
      onClick={() => deleteExpense(index)}
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
            Total Expenses: ₹ {totalExpenses}
          </div>

        </div>

      </div>
    </div>
  );
}

export default VaryingExpenses;