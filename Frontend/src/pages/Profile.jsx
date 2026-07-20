import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const saveProfile = () => {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("userUpdated"));
  setIsEditing(false);

  alert("Profile updated successfully!");
};

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-8">
        Profile
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl">

        <h2 className="text-2xl font-semibold mb-6">
          User Information
        </h2>

          <div className="mb-4">
  <p className="text-gray-500">Full Name</p>

  {isEditing ? (
    <input
      type="text"
      value={user.name}
      onChange={(e) =>
        setUser({ ...user, name: e.target.value })
      }
      className="border p-3 rounded-lg w-full"
    />
  ) : (
    <p className="text-xl font-medium">
      {user.name}
    </p>
  )}
</div>

       <div className="mb-6">
  <p className="text-gray-500">Email</p>

  {isEditing ? (
    <input
      type="email"
      value={user.email}
      onChange={(e) =>
        setUser({ ...user, email: e.target.value })
      }
      className="border p-3 rounded-lg w-full"
    />
  ) : (
    <p className="text-xl font-medium">
      {user.email}
    </p>
  )}
</div>
{isEditing ? (
  <button
    onClick={saveProfile}
    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
  >
    Save Changes
  </button>
) : (
  <button
    onClick={() => setIsEditing(true)}
    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
  >
    Edit Profile
  </button>
)}

      </div>

    </div>
  );
}

export default Profile;