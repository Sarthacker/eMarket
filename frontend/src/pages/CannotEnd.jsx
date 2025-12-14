import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CannotEnd = ({ isLoggedIn, user }) => {
  useEffect(() => {
    document.title = "eMarket | Cannot End";
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} user={user} />

      {/* Main Section */}
      <section className="container mx-auto px-4 py-20 text-center flex-1">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            You Can’t End This Auction
          </h1>

          <p className="text-gray-700 mb-6">
            Sorry, you are not authorized to end this auction.
            Only the user who listed this item can close the auction.
          </p>

          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go Back Home
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CannotEnd;
