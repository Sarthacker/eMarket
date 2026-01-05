import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ListingCreated = ({ isLoggedIn, user }) => {
  useEffect(() => {
    document.title = "eMarket | Listing Created";
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} user={user} />

      {/* Success Message */}
      <section className="flex flex-col items-center justify-center flex-1 px-4">
        <div className="bg-white shadow-md rounded-2xl p-10 text-center max-w-lg w-full">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <DotLottieReact
              src="https://lottie.host/31a87704-d84f-45a2-916e-3d65cbc5ecc9/EuDGbrxFFI.lottie"
              loop
              autoplay
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Listing Created Successfully!
          </h2>

          <p className="text-gray-600 mb-8">
            Your item has been listed for auction. You can track it from your{" "}
            <Link
              to="/my-listings"
              className="text-purple-600 hover:underline"
            >
              My Listings
            </Link>{" "}
            page.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              List Another Item
            </Link>

            <Link
              to="/"
              className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ListingCreated;
