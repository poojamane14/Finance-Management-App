import { useState, useEffect } from "react";
import ExpenseChart from "../components/ExpenseChart";
import SummaryCard from "../components/SummaryCard";

import {
  FaMoneyBillWave,
  FaWallet,
  FaPiggyBank,
  FaChartLine,
} from "react-icons/fa";

function Dashboard() {

const [fixedBudget, setFixedBudget] = useState(0);
const [varyingBudget, setVaryingBudget] = useState(0);
const [savingsGoal, setSavingsGoal] = useState(0);
const [income, setIncome] = useState(0);
const [fixedExpenses, setFixedExpenses] = useState([]);
const [varyingExpenses, setVaryingExpenses] = useState([]);
const [savingsData, setSavingsData] = useState([]);

useEffect(() => {
  setIncome(
  JSON.parse(localStorage.getItem("monthlyIncome")) || 0
);

  setFixedBudget(
    JSON.parse(localStorage.getItem("fixedBudget")) || 0
  );

  setVaryingBudget(
    JSON.parse(localStorage.getItem("varyingBudget")) || 0
  );

  setSavingsGoal(
    JSON.parse(localStorage.getItem("savingsGoal")) || 0
  );
  
  setFixedExpenses(
  JSON.parse(localStorage.getItem("fixedExpenses")) || []
);

setVaryingExpenses(
  JSON.parse(localStorage.getItem("varyingExpenses")) || []
);

setSavingsData(
  JSON.parse(localStorage.getItem("savingsData")) || []
);

}, []);

useEffect(() => {
  localStorage.setItem(
    "monthlyIncome",
    JSON.stringify(income)
  );
}, [income]);

const totalFixedSpent = fixedExpenses.reduce(
  (total, expense) => total + expense.amount,
  0
);

const totalVaryingSpent = varyingExpenses.reduce(
  (total, expense) => total + expense.amount,
  0
);

const totalSaved = savingsData.reduce(
  (total, saving) => total + saving.amount,
  0
);

const fixedPercentage =
  fixedBudget > 0
    ? (totalFixedSpent / fixedBudget) * 100
    : 0;

const varyingPercentage =
  varyingBudget > 0
    ? (totalVaryingSpent / varyingBudget) * 100
    : 0;

const savingsPercentage =
  savingsGoal > 0
    ? (totalSaved / savingsGoal) * 100
    : 0;

  const remainingBalance =
  income - fixedBudget - varyingBudget - savingsGoal;

  return (

    <div className="bg-gray-100 min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-md">

  <h2 className="text-xl font-bold mb-4">
    Monthly Income
  </h2>

  <input
    type="number"
    placeholder="Enter Monthly Income"
    value={income}
    onChange={(e) => setIncome(Number(e.target.value))}
    className="border p-3 rounded-lg outline-none w-full"
  />

</div>

      <div className="flex gap-6 flex-wrap">

        <SummaryCard
          title="Total Income"
          amount={income}
          color="bg-blue-500"
          icon={<FaMoneyBillWave />}
        />

        <SummaryCard
          title="Fixed Budget"
          amount={fixedBudget}
          color="bg-red-500"
          icon={<FaWallet />}
        />

        <SummaryCard
          title="Varying Budget"
          amount={varyingBudget}
          color="bg-orange-500"
          icon={<FaChartLine />}
        />

        <SummaryCard
          title="Savings Goal"
          amount={savingsGoal}
          color="bg-green-500"
          icon={<FaPiggyBank />}
        />

        <SummaryCard
          title="Remaining Balance"
          amount={remainingBalance}
          color="bg-purple-500"
          icon={<FaMoneyBillWave />}
        />

      </div>
     
       <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

  <h2 className="text-2xl font-bold mb-6">
    Financial Progress
  </h2>

  {/* Fixed Expenses */}
  <div className="mb-6">

    <div className="flex justify-between mb-2">
      <span>Fixed Expenses</span>
      <span>{fixedPercentage.toFixed(0)}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-4">

      <div
        className="bg-red-500 h-4 rounded-full"
        style={{ width: `${Math.min(fixedPercentage, 100)}%` }}
      ></div>

    </div>

  </div>

  {/* Varying Expenses */}

  <div className="mb-6">

    <div className="flex justify-between mb-2">
      <span>Varying Expenses</span>
      <span>{varyingPercentage.toFixed(0)}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-4">

      <div
        className="bg-orange-500 h-4 rounded-full"
        style={{ width: `${Math.min(varyingPercentage, 100)}%` }}
      ></div>

    </div>

  </div>

  {/* Savings */}

  <div>

    <div className="flex justify-between mb-2">
      <span>Savings Goal</span>
      <span>{savingsPercentage.toFixed(0)}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-4">

      <div
        className="bg-green-500 h-4 rounded-full"
        style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
      ></div>

    </div>

  </div>

</div>

      <ExpenseChart />

    </div>
  );
}

export default Dashboard;