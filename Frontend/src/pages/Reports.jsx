import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
function Reports() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [reportType, setReportType] = useState("monthly");

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [fromYear, setFromYear] = useState(currentYear);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [toYear, setToYear] = useState(currentYear);

  const [reportGenerated, setReportGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const [reportData, setReportData] = useState({
    fixedExpenses: [],
    varyingExpenses: [],
    savingsData: [],
    fixedGoal: 0,
    varyingGoal: 0,
    savingsGoal: 0,
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [];

  for (let year = 2024; year <= currentYear + 1; year++) {
    years.push(year);
  }

  // --------------------------------------------------
  // GET SELECTED REPORT RANGE
  // --------------------------------------------------

  const getReportRange = () => {
    if (reportType === "monthly") {
      return {
        startMonth: Number(selectedMonth),
        startYear: Number(selectedYear),
        endMonth: Number(selectedMonth),
        endYear: Number(selectedYear),
      };
    }

    if (reportType === "yearly") {
      return {
        startMonth: 1,
        startYear: Number(selectedYear),
        endMonth: 12,
        endYear: Number(selectedYear),
      };
    }

    return {
      startMonth: Number(fromMonth),
      startYear: Number(fromYear),
      endMonth: Number(toMonth),
      endYear: Number(toYear),
    };
  };

  // --------------------------------------------------
  // GET ALL MONTHS IN SELECTED RANGE
  // --------------------------------------------------

  const getMonthsInRange = () => {
    const range = getReportRange();

    const result = [];

    let year = range.startYear;
    let month = range.startMonth;

    while (
      year < range.endYear ||
      (year === range.endYear && month <= range.endMonth)
    ) {
      result.push({ month, year });

      month++;

      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return result;
  };

  // --------------------------------------------------
  // FETCH TRANSACTIONS
  // --------------------------------------------------

  const fetchTransactions = async (monthsInRange) => {
    let fixed = [];
    let varying = [];
    let savings = [];

    for (const period of monthsInRange) {
      const fixedResponse = await fetch(
        `http://127.0.0.1:5000/api/fixed-expenses/${currentUser.id}`
      );

      const varyingResponse = await fetch(
        `http://127.0.0.1:5000/api/varying-expenses/${currentUser.id}`
      );

      const savingsResponse = await fetch(
        `http://127.0.0.1:5000/api/savings/${currentUser.id}`
      );

      if (!fixedResponse.ok || !varyingResponse.ok || !savingsResponse.ok) {
        throw new Error("Unable to fetch transaction data");
      }

      const fixedData = await fixedResponse.json();
      const varyingData = await varyingResponse.json();
      const savingsData = await savingsResponse.json();

      const isInMonth = (transaction, month, year) => {
        if (!transaction.transaction_date) {
          return false;
        }

        const date = new Date(transaction.transaction_date);

        return (
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        );
      };

      fixed = [
        ...fixed,
        ...fixedData.filter((item) =>
          isInMonth(item, period.month, period.year)
        ),
      ];

      varying = [
        ...varying,
        ...varyingData.filter((item) =>
          isInMonth(item, period.month, period.year)
        ),
      ];

      savings = [
        ...savings,
        ...savingsData.filter((item) =>
          isInMonth(item, period.month, period.year)
        ),
      ];
    }

    // Remove duplicate transactions
    const removeDuplicates = (data) => {
      return data.filter(
        (item, index, self) =>
          index === self.findIndex((obj) => obj.id === item.id)
      );
    };

    return {
      fixed: removeDuplicates(fixed),
      varying: removeDuplicates(varying),
      savings: removeDuplicates(savings),
    };
  };

  // --------------------------------------------------
  // FETCH MONTHLY BUDGETS
  // --------------------------------------------------

  const fetchMonthlyBudgets = async (monthsInRange) => {
    let fixedGoal = 0;
    let varyingGoal = 0;
    let savingsGoal = 0;

    for (const period of monthsInRange) {
      const response = await fetch(
        `http://127.0.0.1:5000/api/monthly-budget/${currentUser.id}/${period.year}/${period.month}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch monthly budget");
      }

      const budget = await response.json();

      fixedGoal += Number(budget.fixed_budget || 0);
      varyingGoal += Number(budget.varying_budget || 0);
      savingsGoal += Number(budget.savings_goal || 0);
    }

    return {
      fixedGoal,
      varyingGoal,
      savingsGoal,
    };
  };

  // --------------------------------------------------
  // GENERATE REPORT
  // --------------------------------------------------

  const generateReport = async () => {
    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    const range = getReportRange();

    // Prevent invalid custom range
    if (
      range.startYear > range.endYear ||
      (range.startYear === range.endYear &&
        range.startMonth > range.endMonth)
    ) {
      alert("Please select a valid date range.");
      return;
    }

    try {
      setLoading(true);

      const monthsInRange = getMonthsInRange();

      const transactions = await fetchTransactions(monthsInRange);

      const trend = monthsInRange.map((period) => {
        const fixed = transactions.fixed
          .filter((item) => {
      const date = new Date(item.transaction_date);
      return (
        date.getMonth() + 1 === period.month &&
        date.getFullYear() === period.year
      );
      })
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const variable = transactions.varying
    .filter((item) => {
      const date = new Date(item.transaction_date);
      return (
        date.getMonth() + 1 === period.month &&
        date.getFullYear() === period.year
      );
    })
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    month: `${months[period.month - 1].slice(0, 3)} ${period.year}`,
    spending: fixed + variable,
  };
});

setMonthlyTrend(trend);

      const budgets = await fetchMonthlyBudgets(monthsInRange);

      setReportData({
        fixedExpenses: transactions.fixed,
        varyingExpenses: transactions.varying,
        savingsData: transactions.savings,
        fixedGoal: budgets.fixedGoal,
        varyingGoal: budgets.varyingGoal,
        savingsGoal: budgets.savingsGoal,
      });

      setReportGenerated(true);
    } catch (error) {
      console.error(error);
      alert("Unable to generate report. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totalFixed = reportData.fixedExpenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const totalVariable = reportData.varyingExpenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const totalSavings = reportData.savingsData.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const totalExpenses = totalFixed + totalVariable;

  const fixedDifference = reportData.fixedGoal - totalFixed;
  const variableDifference = reportData.varyingGoal - totalVariable;
  const savingsDifference = totalSavings - reportData.savingsGoal;

  const totalBudgetedExpenses =
    reportData.fixedGoal + reportData.varyingGoal;

  // --------------------------------------------------
  // REPORT TITLE
  // --------------------------------------------------

  const getReportTitle = () => {
    if (reportType === "monthly") {
      return `${months[selectedMonth - 1]} ${selectedYear}`;
    }

    if (reportType === "yearly") {
      return `${selectedYear}`;
    }

    if (fromYear === toYear) {
      return `${months[fromMonth - 1]} – ${months[toMonth - 1]} ${fromYear}`;
    }

    return `${months[fromMonth - 1]} ${fromYear} – ${months[toMonth - 1]} ${toYear}`;
  };

  // --------------------------------------------------
  // DIFFERENCE DISPLAY
  // --------------------------------------------------

  const formatDifference = (difference, isSavings = false) => {
    const value = Math.abs(difference);

    if (isSavings) {
      if (difference >= 0) {
        return `₹${value.toLocaleString()} above goal`;
      }

      return `₹${value.toLocaleString()} below goal`;
    }

    if (difference >= 0) {
      return `₹${value.toLocaleString()} under budget`;
    }

    return `₹${value.toLocaleString()} over budget`;
  };

  // --------------------------------------------------
  // EXPENSE DISTRIBUTION
  // --------------------------------------------------

  const fixedPercentage =
    totalExpenses > 0 ? (totalFixed / totalExpenses) * 100 : 0;

  const variablePercentage =
    totalExpenses > 0 ? (totalVariable / totalExpenses) * 100 : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-8">
        Reports
      </h1>

      {/* ------------------------------------------------
          REPORT SELECTION
      ------------------------------------------------ */}

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

        <h2 className="text-xl font-bold mb-5">
          Select Report Period
        </h2>

        {/* REPORT TYPE */}
        <div className="flex flex-wrap gap-6 mb-6">

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportType"
              value="monthly"
              checked={reportType === "monthly"}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportGenerated(false);
              }}
            />
            Monthly
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportType"
              value="yearly"
              checked={reportType === "yearly"}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportGenerated(false);
              }}
            />
            Yearly
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportType"
              value="custom"
              checked={reportType === "custom"}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportGenerated(false);
              }}
            />
            Custom Period
          </label>

        </div>

        {/* MONTHLY */}
        {reportType === "monthly" && (
          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-2">
                Month
              </label>

              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setReportGenerated(false);
                }}
                className="w-full border p-3 rounded-lg"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Year
              </label>

              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setReportGenerated(false);
                }}
                className="w-full border p-3 rounded-lg"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}

        {/* YEARLY */}
        {reportType === "yearly" && (
          <div className="max-w-md">

            <label className="block text-sm font-medium mb-2">
              Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setReportGenerated(false);
              }}
              className="w-full border p-3 rounded-lg"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

          </div>
        )}

        {/* CUSTOM PERIOD */}
        {reportType === "custom" && (
          <div className="grid md:grid-cols-2 gap-6">

            <div className="border p-4 rounded-xl">

              <h3 className="font-semibold mb-3">
                From
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <select
                  value={fromMonth}
                  onChange={(e) => {
                    setFromMonth(Number(e.target.value));
                    setReportGenerated(false);
                  }}
                  className="border p-3 rounded-lg"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={fromYear}
                  onChange={(e) => {
                    setFromYear(Number(e.target.value));
                    setReportGenerated(false);
                  }}
                  className="border p-3 rounded-lg"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            <div className="border p-4 rounded-xl">

              <h3 className="font-semibold mb-3">
                To
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <select
                  value={toMonth}
                  onChange={(e) => {
                    setToMonth(Number(e.target.value));
                    setReportGenerated(false);
                  }}
                  className="border p-3 rounded-lg"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={toYear}
                  onChange={(e) => {
                    setToYear(Number(e.target.value));
                    setReportGenerated(false);
                  }}
                  className="border p-3 rounded-lg"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>
        )}

        <button
          onClick={generateReport}
          disabled={loading}
          className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

      </div>

      {/* ------------------------------------------------
          GENERATED REPORT
      ------------------------------------------------ */}

      {reportGenerated && (
        <>

          <h2 className="text-2xl font-bold mb-6">
            Report: {getReportTitle()}
          </h2>

          {/* ------------------------------------------------
              BUDGET PERFORMANCE
          ------------------------------------------------ */}

          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

            <h2 className="text-xl font-bold mb-6">
              Budget Performance
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              {/* FIXED */}
              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Fixed Expenses
                </h3>

                <p className="text-gray-600">
                  Goal to Spend
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{reportData.fixedGoal.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Actual Spent
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{totalFixed.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Difference
                </p>

                <p
                  className={`font-semibold ${
                    fixedDifference >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatDifference(fixedDifference)}
                </p>

              </div>

              {/* VARIABLE */}
              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Variable Expenses
                </h3>

                <p className="text-gray-600">
                  Goal to Spend
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{reportData.varyingGoal.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Actual Spent
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{totalVariable.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Difference
                </p>

                <p
                  className={`font-semibold ${
                    variableDifference >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatDifference(variableDifference)}
                </p>

              </div>

              {/* SAVINGS */}
              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Savings
                </h3>

                <p className="text-gray-600">
                  Goal to Save
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{reportData.savingsGoal.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Actual Saved
                </p>

                <p className="text-xl font-bold mb-3">
                  ₹{totalSavings.toLocaleString()}
                </p>

                <p className="text-gray-600">
                  Difference
                </p>

                <p
                  className={`font-semibold ${
                    savingsDifference >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatDifference(savingsDifference, true)}
                </p>

              </div>

            </div>

          </div>

          {/* ------------------------------------------------
              OVERALL FINANCIAL SUMMARY
          ------------------------------------------------ */}

          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

            <h2 className="text-xl font-bold mb-6">
              Overall Financial Summary
            </h2>

            <div className="grid md:grid-cols-4 gap-5">

              <div className="border rounded-xl p-5">
                <p className="text-gray-500">
                  Total Budgeted Expenses
                </p>

                <p className="text-2xl font-bold mt-2">
                  ₹{totalBudgetedExpenses.toLocaleString()}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-gray-500">
                  Total Expenses
                </p>

                <p className="text-2xl font-bold mt-2">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-gray-500">
                  Total Savings
                </p>

                <p className="text-2xl font-bold mt-2">
                  ₹{totalSavings.toLocaleString()}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-gray-500">
                  Net Difference
                </p>

                <p
                  className={`text-2xl font-bold mt-2 ${
                    totalBudgetedExpenses - totalExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{Math.abs(
                    totalBudgetedExpenses - totalExpenses
                  ).toLocaleString()}
                </p>
              </div>

            </div>

          </div>

          {/* ------------------------------------------------
              EXPENSE DISTRIBUTION
          ------------------------------------------------ */}

          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

            <h2 className="text-xl font-bold mb-6">
              Expense Distribution
            </h2>

            <div className="space-y-5">

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Fixed Expenses
                  </span>

                  <span>
                    ₹{totalFixed.toLocaleString()} (
                    {fixedPercentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{
                      width: `${fixedPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Variable Expenses
                  </span>

                  <span>
                    ₹{totalVariable.toLocaleString()} (
                    {variablePercentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-orange-500 h-4 rounded-full"
                    style={{
                      width: `${variablePercentage}%`,
                    }}
                  />
                </div>
              </div>

            </div>

            <p className="text-sm text-gray-500 mt-5">
              Savings are shown separately because savings are not an expense.
            </p>

          </div>

          {/* Monthly Spending Trend */}
{monthlyTrend.length > 1 && (
  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      Monthly Spending Trend
    </h2>

    <p className="text-gray-600 text-sm mb-5">
      Total spending across Fixed and Variable expenses for each month.
    </p>

    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyTrend}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${value}`}
          />

          <Tooltip
            formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Spending"]}
          />

          <Line
            type="monotone"
            dataKey="spending"
            stroke="#4F46E5"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

          {/* ------------------------------------------------
              TRANSACTION HISTORY
          ------------------------------------------------ */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-xl font-bold mb-6">
              Transaction History
            </h2>

            {/* FIXED TRANSACTIONS */}
            <div className="mb-10">

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-bold">
                  Fixed Expenses
                </h3>

                <span className="font-semibold">
                  Total: ₹{totalFixed.toLocaleString()}
                </span>

              </div>

              {reportData.fixedExpenses.length === 0 ? (
                <p className="text-gray-500">
                  No fixed expenses found for this period.
                </p>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3">Date</th>
                        <th className="p-3">Merchant</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.fixedExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b"
                        >
                          <td className="p-3">
                            {expense.transaction_date
                              ? new Date(
                                  expense.transaction_date
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="p-3">
                            {expense.merchant}
                          </td>

                          <td className="p-3">
                            {expense.description || "-"}
                          </td>

                          <td className="p-3 font-semibold">
                            ₹{Number(expense.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* VARIABLE TRANSACTIONS */}
            <div className="mb-10">

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-bold">
                  Variable Expenses
                </h3>

                <span className="font-semibold">
                  Total: ₹{totalVariable.toLocaleString()}
                </span>

              </div>

              {reportData.varyingExpenses.length === 0 ? (
                <p className="text-gray-500">
                  No variable expenses found for this period.
                </p>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3">Date</th>
                        <th className="p-3">Merchant</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.varyingExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b"
                        >
                          <td className="p-3">
                            {expense.transaction_date
                              ? new Date(
                                  expense.transaction_date
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="p-3">
                            {expense.merchant}
                          </td>

                          <td className="p-3">
                            {expense.description || "-"}
                          </td>

                          <td className="p-3 font-semibold">
                            ₹{Number(expense.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* SAVINGS TRANSACTIONS */}
            <div>

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-bold">
                  Savings
                </h3>

                <span className="font-semibold">
                  Total: ₹{totalSavings.toLocaleString()}
                </span>

              </div>

              {reportData.savingsData.length === 0 ? (
                <p className="text-gray-500">
                  No savings found for this period.
                </p>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3">Date</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.savingsData.map((saving) => (
                        <tr
                          key={saving.id}
                          className="border-b"
                        >
                          <td className="p-3">
                            {saving.transaction_date
                              ? new Date(
                                  saving.transaction_date
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="p-3">
                            {saving.merchant}
                          </td>

                          <td className="p-3">
                            {saving.description || "-"}
                          </td>

                          <td className="p-3 font-semibold">
                            ₹{Number(saving.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default Reports;