import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function ExpenseChart() {

  const data = [
    { name: "Fixed Expenses", value: 20000 },
    { name: "Variable Expenses", value: 30000 },
    { name: "Savings", value: 50000 },
  ];

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#22c55e",
  ];

  return (

    <div className="bg-white p-6 rounded-2xl shadow-md mt-10 w-fit">

      <h1 className="text-2xl font-bold mb-6">
        Expense Distribution
      </h1>

      <PieChart width={400} height={300}>

        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >

          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index]}
            />
          ))}

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </div>
  );
}

export default ExpenseChart;