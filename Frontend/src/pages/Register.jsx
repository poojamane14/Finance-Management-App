import { Link } from "react-router-dom";
import { useState } from "react";
function Register() {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const handleRegister = async () => {

  if (
    name === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    alert("Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {

    const response = await fetch(
      "http://127.0.0.1:5000/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      alert("Registration Successful!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } else {

      alert(data.error || "Registration failed");

    }

  } catch (error) {

    console.error("Registration error:", error);

    alert(
      "Unable to connect to server. Please try again."
    );

  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-md w-96">

        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>

        <input
  type="text"
  placeholder="Enter Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
/>

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

        <input
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  className="w-full border p-3 rounded-lg mb-4"
/>

       <button
       onClick={handleRegister}
       className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
>
          Register
        </button>

        <p className="text-center mt-4">
  Already have an account?{" "}
  <Link
    to="/login"
    className="text-blue-500 font-semibold"
  >
    Login
  </Link>
</p>

      </div>

    </div>
  );
}

export default Register;