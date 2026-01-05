import { useEffect } from "react";
import { Link } from "react-router-dom";

function NoItem(){
  useEffect(() => {
    document.title = "eMarket | Item Not Found";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full">
        <div className="text-5xl mb-4 text-red-600">⚠️</div>

        <h2 className="text-2xl font-bold mb-2">
          No Such Item Found
        </h2>

        <p className="text-gray-500 mb-6">
          The item you are trying to view either doesn’t exist or has been
          removed by the seller.
        </p>

        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NoItem;
