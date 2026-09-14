import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile from backend
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/profile/${currentUser.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Failed to load profile");
          return;
        }

        setUser({
          name: data.name,
          email: data.email,
        });

        // Keep currentUser updated in localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...currentUser,
            name: data.name,
            email: data.email,
          })
        );
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Save profile to backend
  const saveProfile = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/profile/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update profile");
        return;
      }

      // Update currentUser after successful backend update
      localStorage.setItem(
        "currentUser",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(new Event("userUpdated"));

      setUser({
        name: data.user.name,
        email: data.user.email,
      });

      setIsEditing(false);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Unable to connect to the backend.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">
          Profile
        </h1>

        <p className="text-gray-600">
          Loading profile...
        </p>
      </div>
    );
  }

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
          <p className="text-gray-500">
            Full Name
          </p>

          {isEditing ? (
            <input
              type="text"
              value={user.name}
              onChange={(e) =>
                setUser({
                  ...user,
                  name: e.target.value,
                })
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
          <p className="text-gray-500">
            Email
          </p>

          {isEditing ? (
            <input
              type="email"
              value={user.email}
              onChange={(e) =>
                setUser({
                  ...user,
                  email: e.target.value,
                })
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