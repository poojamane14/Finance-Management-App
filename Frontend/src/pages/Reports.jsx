import { useState, useEffect } from "react";
function Reports() {
  const [reportType, setReportType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [fixedExpenses, setFixedExpenses] = useState([]);
const [varyingExpenses, setVaryingExpenses] = useState([]);
const [savingsData, setSavingsData] = useState([]);

useEffect(() => {
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">
        Reports
      </h1>

      {/* Report Selection */}
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Generate Report
        </h2>

        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input
  type="radio"
  name="reportType"
  value="monthly"
  checked={reportType === "monthly"}
  onChange={(e) => setReportType(e.target.value)}
/>
            Monthly
          </label>

          <label className="flex items-center gap-2">
            <input
  type="radio"
  name="reportType"
  value="yearly"
  checked={reportType === "yearly"}
  onChange={(e) => setReportType(e.target.value)}
/>
            Yearly
          </label>
        </div>
       
       {reportType === "monthly" && (
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="w-full border p-3 rounded-lg mb-4"
  >
    <option value="">Select Month</option>
    <option value="0">January</option>
    <option value="1">February</option>
    <option value="2">March</option>
    <option value="3">April</option>
    <option value="4">May</option>
    <option value="5">June</option>
    <option value="6">July</option>
    <option value="7">August</option>
    <option value="8">September</option>
    <option value="9">October</option>
    <option value="10">November</option>
    <option value="11">December</option>
  </select>
)}

 {reportType === "yearly" && (
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="w-full border p-3 rounded-lg mb-4"
  >
    <option value="2024">2024</option>
    <option value="2025">2025</option>
    <option value="2026">2026</option>
    <option value="2027">2027</option>
  </select>
)}

        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
          Generate Report
        </button>
      </div>
    </div>
  );
}

export default Reports;