function SummaryCard({ title, amount, color, icon }) {
  return (

    <div className={`p-6 rounded-2xl shadow-md w-64 text-white ${color}
    hover:scale-105 transition duration-300`}>

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-lg">
            {title}
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            ₹ {amount}
          </h1>
        </div>

        <div className="text-4xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default SummaryCard;