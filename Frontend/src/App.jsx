import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import VaryingExpenses from "./pages/VaryingExpenses";
<Route path="/varying-expenses" element={<VaryingExpenses />} />
import Dashboard from "./pages/Dashboard";
import FixedExpenses from "./pages/FixedExpenses";
import VariableExpenses from "./pages/VaryingExpenses";
import Savings from "./pages/Savings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
<Route path="/savings" element={<Savings />} />

function App() {
  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-5 bg-gray-100 min-h-screen">

        <Navbar />

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/fixed-expenses"
            element={<FixedExpenses />}
          />

          <Route
            path="/varying-expenses"
            element={<VaryingExpenses />}
          />

          <Route
            path="/savings"
            element={<Savings />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Routes>

      </div>

    </div>
  );
}

export default App;