import { useEffect, useState } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar() {

  const loadUser = () => {
  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (savedUser) {
    setUserName(savedUser.name);
  }
};

  const [userName, setUserName] = useState("");

 useEffect(() => {
  loadUser();

  window.addEventListener("userUpdated", loadUser);

  return () => {
    window.removeEventListener("userUpdated", loadUser);
  };
}, []);

  const navigate = useNavigate();

  const goToProfile = () => {
  navigate("/profile");
};
const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  navigate("/login");
};

  return (

    <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">

      <h1 className="text-2xl font-bold">
        Finance Dashboard
      </h1>

      <div className="flex items-center gap-6">

        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">

          <FaSearch className="text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2"
          />

        </div>

        <FaBell className="text-2xl cursor-pointer text-gray-600" />

        <div
  onClick={goToProfile}
  className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition"
>
  <FaUserCircle className="text-3xl text-gray-600" />
  <span className="font-medium">{userName || "User"}</span>
</div>
        <button
  onClick={handleLogout}
  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
>
  Logout
</button>

      </div>

    </div>

  );
}

export default Navbar;