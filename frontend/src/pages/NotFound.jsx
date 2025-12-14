import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFound({ isLoggedIn, user }){
  useEffect(() => {
    document.title = "eMarket | Page Not Found";
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} user={user} />

      {/* 404 Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-20 px-4">
        <h1 className="text-6xl font-extrabold text-blue-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Oops! The page you’re looking for doesn’t exist or has been moved.
          Please check the URL or return to the homepage.
        </p>

        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
