import { useState, useEffect } from "react";

function Savings() {
  const [savingName, setSavingName] = useState("");
  const [savingAmount, setSavingAmount] = useState("");
  const [savingsData, setSavingsData] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState("");

  useEffect(() => {
  const savedSavings = localStorage.getItem("savingsData");

  if (savedSavings) {
    setSavingsData(JSON.parse(savedSavings));
  }
}, []);

useEffect(() => {
  const savedBudget = localStorage.getItem("savingsGoal");

  if (savedBudget) {
    setSavingsGoal(JSON.parse(savedBudget));
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    "savingsGoal",
    JSON.stringify(savingsGoal)
  );
}, [savingsGoal]);

 useEffect(() => {
  localStorage.setItem(
    "savingsData",
    JSON.stringify(savingsData)
  );
}, [savingsData]);

  const addSaving = () => {
    if (savingName === "" || savingAmount === "") {
      alert("Please fill all fields");
      return;
    }

    const newSaving = {
      name: savingName,
      amount: Number(savingAmount),
        createdAt: new Date().toISOString(),

    };

 setSavingsData([...savingsData, newSaving]);

  setSavingName("");
  setSavingAmount("");
};

const deleteSaving = (indexToDelete) => {
  console.log("DELETE CLICKED:", indexToDelete);

  setSavingsData((prevSavings) =>
    prevSavings.filter((_, index) => index !== indexToDelete)
  );
};

  const totalSaved = savingsData.reduce(
    (total, saving) => total + saving.amount,
    0
  );

  const remainingBalance = savingsGoal - totalSaved;

  return (
    <div className="p-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">
        Savings
      </h1>
      
       <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-md">

  <h2 className="text-xl font-bold mb-4">
    Set Savings Goal
  </h2>

  <input
    type="number"
    placeholder="Enter Savings Goal Amount"
    value={savingsGoal}
    onChange={(e) => setSavingsGoal(Number(e.target.value))}
    className="border p-3 rounded-lg outline-none w-full"
  />

</div>

<div className="flex gap-6 flex-wrap mb-8">

  {/* Budget Card */}
  <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Savings Goal</h2>

    <h1 className="text-3xl font-bold mt-3">
      ₹ {savingsGoal}
    </h1>
  </div>

  {/* Spent Card */}
  <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Total Saved</h2>

    <h1 className="text-3xl font-bold mt-3">
      ₹ {totalSaved}
    </h1>
  </div>

  {/* Remaining Card */}
  <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md w-64">
    <h2 className="text-lg">Need to Save</h2>

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
            Add Savings
          </h2>

          <div className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Enter Savings source"
              value={savingName}
              onChange={(e) => setSavingName(e.target.value)}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="number"
              placeholder="Enter Amount"
              value={savingAmount}
              onChange={(e) => setSavingAmount(e.target.value)}
              className="border p-3 rounded-lg outline-none"
            />

            <button
              onClick={addSaving}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Add Savings
            </button>

          </div>
        </div>

        {/* RIGHT SIDE - EXPENSE LIST */}
         <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl flex-1 h-[420px] flex flex-col min-h-0">
          <h2 className="text-2xl font-bold mb-5">
            Saving List
          </h2>

          {savingsData.length === 0 ? (
            <p className="text-gray-500">
              No savings added yet.
            </p>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 min-h-0">

              {savingsData.map((saving, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">

  <div
  >
    <h3 className="font-medium">{saving.name}</h3>
    <p className="text-sm text-gray-500">
    {saving.createdAt &&
      `📅 ${new Date(saving.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`}
  </p>
  </div>

  <div className="flex items-center gap-4">

    <h3 className="font-semibold">₹ {saving.amount}</h3>

    <button
      onClick={() => deleteSaving(index)}
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
            Total Savings: ₹ {totalSaved}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Savings;