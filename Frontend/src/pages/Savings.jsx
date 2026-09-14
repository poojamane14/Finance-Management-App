import { useState, useEffect } from "react";

function Savings() {
  const [savingName, setSavingName] = useState("");
  const [savingAmount, setSavingAmount] = useState("");
  const [savingsData, setSavingsData] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState("");

  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load savings and savings goal from MySQL
  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      return;
    }

    // Load savings from MySQL
    fetch(
      `http://127.0.0.1:5000/api/savings/${currentUser.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Savings:", data);

        if (Array.isArray(data)) {
          const formattedSavings = data.map((saving) => ({
            id: saving.id,
            name: saving.merchant,
            amount: saving.amount,
            createdAt: saving.transaction_date,
          }));

          setSavingsData(formattedSavings);
        }
      })
      .catch((error) => {
        console.error("Error loading savings:", error);
      });

    // Load savings goal from MySQL
    fetch(
      `http://127.0.0.1:5000/api/financial-profile/${currentUser.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Financial profile:", data);

        if (data.savings_goal !== undefined) {
          setSavingsGoal(data.savings_goal);
        }

        setProfileLoaded(true);
      })
      .catch((error) => {
        console.error(
          "Error loading financial profile:",
          error
        );
      });
  }, []);

  // Save savings goal to MySQL
  useEffect(() => {
    if (!profileLoaded) {
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      return;
    }

    fetch(
      "http://127.0.0.1:5000/api/financial-profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          savings_goal: savingsGoal,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Savings goal saved:", data);
      })
      .catch((error) => {
        console.error(
          "Error saving savings goal:",
          error
        );
      });
  }, [savingsGoal, profileLoaded]);

  // Add saving
  const addSaving = async () => {
    if (savingName === "" || savingAmount === "") {
      alert("Please fill all fields");
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/savings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            amount: Number(savingAmount),
            merchant: savingName,
            description: "Savings",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Saving added:", data);

        // Reload savings from MySQL
        const savingsResponse = await fetch(
          `http://127.0.0.1:5000/api/savings/${currentUser.id}`
        );

        const savingsDataResponse =
          await savingsResponse.json();

        const formattedSavings =
          savingsDataResponse.map((saving) => ({
            id: saving.id,
            name: saving.merchant,
            amount: saving.amount,
            createdAt: saving.transaction_date,
          }));

        setSavingsData(formattedSavings);

        setSavingName("");
        setSavingAmount("");

        alert("Saving added successfully!");
      } else {
        alert(
          data.error || "Failed to add saving."
        );
      }
    } catch (error) {
      console.error("Error adding saving:", error);
      alert("Unable to connect to server.");
    }
  };

  // Delete saving
  const deleteSaving = async (transactionId) => {
    console.log("DELETE CLICKED:", transactionId);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/savings/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Saving deleted:", data);

        setSavingsData((prevSavings) =>
          prevSavings.filter(
            (saving) => saving.id !== transactionId
          )
        );

        alert("Saving deleted successfully!");
      } else {
        alert(
          data.error || "Failed to delete saving."
        );
      }
    } catch (error) {
      console.error("Error deleting saving:", error);
      alert("Unable to connect to server.");
    }
  };

  const totalSaved = savingsData.reduce(
    (total, saving) =>
      total + Number(saving.amount),
    0
  );

  const remainingBalance =
    Number(savingsGoal || 0) - totalSaved;

  return (
    <div className="p-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">
        Savings
      </h1>

      {/* Savings Goal */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-md">

        <h2 className="text-xl font-bold mb-4">
          Set Savings Goal
        </h2>

        <input
          type="number"
          placeholder="Enter Savings Goal Amount"
          value={savingsGoal}
          onChange={(e) =>
            setSavingsGoal(Number(e.target.value))
          }
          className="border p-3 rounded-lg outline-none w-full"
        />

      </div>

      {/* Summary Cards */}
      <div className="flex gap-6 flex-wrap mb-8">

        {/* Savings Goal */}
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Savings Goal
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {savingsGoal}
          </h1>

        </div>

        {/* Total Saved */}
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Total Saved
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {totalSaved}
          </h1>

        </div>

        {/* Remaining */}
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md w-64">

          <h2 className="text-lg">
            Need to Save
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {remainingBalance}
          </h1>

        </div>

      </div>

      {/* Main Container */}
      <div className="flex gap-8 items-start flex-wrap">

        {/* LEFT SIDE - FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl flex-1 h-[400px] flex flex-col">

          <h2 className="text-xl font-bold mb-4">
            Add Savings
          </h2>

          <div className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Enter Savings source"
              value={savingName}
              onChange={(e) =>
                setSavingName(e.target.value)
              }
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="number"
              placeholder="Enter Amount"
              value={savingAmount}
              onChange={(e) =>
                setSavingAmount(e.target.value)
              }
              className="border p-3 rounded-lg outline-none"
            />

            <button
              onClick={addSaving}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Add Savings
            </button>

          </div>

        </div>

        {/* RIGHT SIDE - SAVING LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl flex-1 h-[420px] flex flex-col min-h-0">

          <h2 className="text-2xl font-bold mb-5">
            Saving List
          </h2>

          {savingsData.length === 0 ? (
            <p className="text-gray-500">
              No savings added yet.
            </p>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 min-h-0">

              {savingsData.map((saving) => (

                <div
                  key={saving.id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                >

                  <div>

                    <h3 className="font-medium">
                      {saving.name}
                    </h3>

                    <p className="text-sm text-gray-500">

                      {saving.createdAt &&
                        `📅 ${new Date(
                          saving.createdAt
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}

                      `}

                    </p>

                  </div>

                  <div className="flex items-center gap-4">

                    <h3 className="font-semibold">
                      ₹ {saving.amount}
                    </h3>

                    <button
                      onClick={() =>
                        deleteSaving(saving.id)
                      }
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      🗑
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

          {/* Total */}
          <div className="mt-6 text-xl font-bold">
            Total Savings: ₹ {totalSaved}
          </div>

        </div>

      </div>

    </div>
  );
}

export default Savings;