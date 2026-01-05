import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { API_URL, getImageUrl } from "../config";
import { PropagateLoader } from "react-spinners";

function MyListings(){
  const { user, isLoggedIn } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "eMarket | My Listings";
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/my-listings`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          // Filter out deleted listings
          const filteredListings = (data.listings || []).filter(listing => !listing.isDeleted);
          setListings(filteredListings);
        }
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="container mx-auto px-4 py-10 flex-1">
        <h2 className="text-3xl font-semibold text-center mb-8">
          My Listings
        </h2>

        {loading ? (
          <div className="min-h-screen flex items-center justify-center text-gray-500">
            <PropagateLoader
              color="#d053e6"
              size={25}
              speedMultiplier={1}
            />
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={
                    listing.image && listing.image.trim() !== ""
                      ? getImageUrl(listing.image)
                      : "/logo/default.png"
                  }
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Current Bid: ₹{listing.currentBid}
                  </p>

                  <div className="flex justify-between">
                    <Link
                      to={`/item/${listing._id}`}
                      className="text-purple-600 hover:underline"
                    >
                      View
                    </Link>

                    {listing.active && (
                      <Link
                        to={`/item/${listing._id}/edit`}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <h3 className="text-xl font-medium mb-4">
              You haven’t listed any items yet.
            </h3>
            <Link
              to="/create"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyListings;
