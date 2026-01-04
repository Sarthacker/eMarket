import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL, getImageUrl } from "../config";

const Home = () => {
  const [activeItems, setActiveItems] = useState([]);
  const [finishedItems, setFinishedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "eMarket | Home";
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/listings`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setActiveItems(data.activeItems || []);
          setFinishedItems(data.finishedItems || []);
        }
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to eMarket
        </h1>
        <p className="text-lg mb-6">
          Bid. Win. Sell. Experience real-time auctions like never before.
        </p>
        <Link
          to="/create"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Start Selling
        </Link>
      </section>

      {/* Active Auctions */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8 text-gray-700">
          🔥 Active Auctions
        </h2>

        {activeItems.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={
                    item.image && item.image.trim() !== ""
                      ? getImageUrl(item.image)
                      : "/logo/default.png"
                  }
                  alt={item.name}
                  className="w-full h-48 object-cover opacity-80"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.description.substring(0, 60)}...
                  </p>
                  <p className="text-blue-600 font-semibold mb-2">
                    Starting Bid: ₹{item.startingBid}
                  </p>
                  <p className="text-blue-600 font-semibold mb-4">
                    Current Bid: ₹{item.currentBid}
                  </p>
                  <Link
                    to={`/item/${item._id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Place a Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No active auctions at the moment. Be the first to{" "}
            <Link to="/create" className="text-blue-600 hover:underline">
              list an item
            </Link>
            !
          </p>
        )}
      </section>

      {/* Finished Auctions */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-8 text-gray-700">
          🏁 Finished Auctions
        </h2>

        {finishedItems.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {finishedItems.map((item) => (
              <div
                key={item._id}
                className="bg-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <img
                  src={
                    item.image && item.image.trim() !== ""
                      ? getImageUrl(item.image)
                      : "/logo/default.png"
                  }
                  alt={item.name}
                  className="w-full h-48 object-cover opacity-80"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description.substring(0, 60)}...
                  </p>
                  <p className="text-gray-700 font-semibold mb-2">
                    Starting Bid: ₹{item.startingBid}
                  </p>
                  <p className="text-green-600 font-semibold mb-2">
                    Final Bid: ₹{item.currentBid}
                  </p>
                  <Link
                    to={`/item/${item._id}`}
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    View Item
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No finished auctions yet. Keep bidding to win amazing items!
          </p>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
