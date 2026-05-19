import {
  FaHome,
  FaWallet,
  FaMoneyBill,
  FaPiggyBank,
  FaChartBar,
  FaUser,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Sidebar() {
  return (

    <div className="w-64 h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold text-green-400 mb-12">
        Finova
      </h1>

      <ul className="space-y-6 text-lg">

        <Link to="/">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaHome />
            Dashboard
          </li>
        </Link>

        <Link to="/fixed-expenses">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaWallet />
            Fixed Expenses
          </li>
        </Link>

        <Link to="/variable-expenses">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaMoneyBill />
            Variable Expenses
          </li>
        </Link>

        <Link to="/savings">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaPiggyBank />
            Savings
          </li>
        </Link>

        <Link to="/reports">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaChartBar />
            Reports
          </li>
        </Link>

        <Link to="/profile">
          <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer transition duration-300">
            <FaUser />
            Profile
          </li>
        </Link>

      </ul>

    </div>
  );
}

export default Sidebar;