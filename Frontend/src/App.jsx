import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FixedExpenses from "./pages/FixedExpenses";
import VaryingExpenses from "./pages/VaryingExpenses";
import Savings from "./pages/Savings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function App() {

  const location = useLocation();

const hideLayout =
  location.pathname === "/login" ||
  location.pathname === "/register";
 
  return (

    <div className="flex">

      {!hideLayout && <Sidebar />}

      <div className="flex-1 p-5 bg-gray-100 min-h-screen">

        {!hideLayout && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        <Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
         <Route
  path="/fixed-expenses"
  element={
    <ProtectedRoute>
      <FixedExpenses />
    </ProtectedRoute>
  }
/>
         <Route
  path="/varying-expenses"
  element={
    <ProtectedRoute>
      <VaryingExpenses />
    </ProtectedRoute>
  }
/>

<Route
  path="/savings"
  element={
    <ProtectedRoute>
      <Savings />
    </ProtectedRoute>
  }
/>

<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

        </Routes>

      </div>

    </div>
  );
}

export default App;