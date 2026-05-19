import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

function Navbar() {
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

        <FaUserCircle className="text-3xl cursor-pointer text-gray-600" />

      </div>

    </div>

  );
}

export default Navbar;