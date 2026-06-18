import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleLogin = () => {

  const savedUser = JSON.parse(
    localStorage.getItem("user")
  );

  if (!savedUser) {
    alert("No user found. Please register first.");
    return;
  }

  if (
    email === savedUser.email &&
    password === savedUser.password
  ) {
    localStorage.setItem("isLoggedIn", "true");

    alert("Login Successful!");
    navigate("/");
  } else {
    alert("Invalid Email or Password");
  }

};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-md w-96">

        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

        <input
  type="email"
  placeholder="Enter Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
/>

        <input
  type="password"
  placeholder="Enter Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
/>
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
        >
          Login
        </button>

        <p className="text-center mt-4">
  Don't have an account?{" "}
  <Link
    to="/register"
    className="text-blue-500 font-semibold"
  >
    Register
  </Link>
</p>

      </div>

    </div>
  );
}

export default Login;