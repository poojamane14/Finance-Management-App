import ExpenseChart from "../components/ExpenseChart";
import SummaryCard from "../components/SummaryCard";

import {
  FaMoneyBillWave,
  FaWallet,
  FaPiggyBank,
  FaChartLine,
} from "react-icons/fa";

function Dashboard() {

  const income = 100000;
  const fixedExpenses = 20000;
  const variableExpenses = 30000;
  const savings = 50000;

  const remainingBalance =
    income - fixedExpenses - variableExpenses - savings;

  return (

    <div className="bg-gray-100 min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="flex gap-6 flex-wrap">

        <SummaryCard
          title="Total Income"
          amount={income}
          color="bg-blue-500"
          icon={<FaMoneyBillWave />}
        />

        <SummaryCard
          title="Fixed Expenses"
          amount={fixedExpenses}
          color="bg-red-500"
          icon={<FaWallet />}
        />

        <SummaryCard
          title="Variable Expenses"
          amount={variableExpenses}
          color="bg-orange-500"
          icon={<FaChartLine />}
        />

        <SummaryCard
          title="Savings"
          amount={savings}
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
      <ExpenseChart />

    </div>
  );
}

export default Dashboard;