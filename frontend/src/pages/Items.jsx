import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { API_URL, getImageUrl } from "../config";
import { PropagateLoader } from "react-spinners";

function Items(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [item, setItem] = useState(null);
  const [listedBy, setListedBy] = useState(null);
  const [highestBidingUser, setHighestBidingUser] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = item ? `eMarket | ${item.name}` : "eMarket | Item";
  }, [item]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${API_URL}/api/listings/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load item");
          return;
        }

        // Redirect if item is deleted
        if (data.item?.isDeleted) {
          navigate("/not-found");
          return;
        }
        setItem(data.item);
        setListedBy(data.listedBy);
        setHighestBidingUser(data.highestBidingUser);
      } catch (err) {
        setError("Something went wrong");
      }
    };

    fetchItem();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/listings/${id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bidAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bid failed");
        return;
      }

      // refresh item
      setItem(data.item);
      setHighestBidingUser(data.highestBidingUser);
      setBidAmount("");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleEndAuction = async () => {
    try {
      const res = await fetch(`${API_URL}/api/listings/${id}/end`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to end auction");
        return;
      }

      // Refetch item to get updated state
      const itemRes = await fetch(`${API_URL}/api/listings/${id}`, { credentials: "include" });
      const itemData = await itemRes.json();
      setItem(itemData.item);
    } catch (err) {
      setError("Something went wrong");
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <PropagateLoader
          color="#d053e6"
          size={25}
          speedMultiplier={1}
        />
      </div>
    );
  }

  const currentBid = item.currentBid || item.startingBid;
  const isOwner = user && listedBy && user.username === listedBy.username;

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar />

      {/* Item Section */}
      <section className="container mx-auto px-4 py-12 flex-1">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden md:flex">
          {/* Image */}
          <div className="md:w-1/2">
            <img
              src={
                item.image && item.image.trim() !== ""
                  ? getImageUrl(item.image)
                  : "/logo/default.png"
              }
              alt={item.name}
              className="w-full h-80 object-cover md:h-full"
            />
          </div>

          {/* Item Details */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
              <p className="text-gray-600 mb-4">
                Listed By <b>{listedBy?.username}</b>
              </p>
              <p className="text-gray-600 mb-4">{item.description}</p>

              {/* Current Bid */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-700">
                  Current Highest Bid:
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{currentBid}
                </p>
                {highestBidingUser?.username && (
                  <p className="text-sm text-gray-500 mt-1">
                    By {highestBidingUser.username}
                  </p>
                )}
              </div>

              {/* Auction Status */}
              <div className="mb-6">
                {item.active ? (
                  <>
                    <p className="text-lg font-semibold text-gray-700">
                      Auction Ends:
                    </p>
                    <p className="text-gray-600">
                      {new Date(item.endDate).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-gray-700">
                    Auction has been ended by the owner
                  </p>
                )}
              </div>
            </div>

            {/* CONDITIONAL ACTIONS */}
            {!item.active ? (
              /* Auction Ended */
              <div className="mt-6 bg-gray-100 border border-gray-300 rounded-lg p-5 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Auction Ended
                </h2>

                {highestBidingUser &&
                highestBidingUser.username &&
                highestBidingUser.username !== listedBy.username ? (
                  <p className="mt-2 text-gray-700">
                    The item has been bought by{" "}
                    <b>{highestBidingUser.username}</b> for{" "}
                    <span className="font-semibold text-blue-600">
                      ₹{item.currentBid}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-gray-700">
                    No bids were placed on this item.
                  </p>
                )}
              </div>
            ) : isOwner ? (
              /* Owner: End Auction */
              <button
                onClick={handleEndAuction}
                className="mt-6 w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                End Auction
              </button>
            ) : (
              /* Bid Form */
              <form onSubmit={handleBid} className="mt-6 space-y-4">
                <label className="block text-gray-700 font-semibold">
                  Place Your Bid (₹)
                </label>
                <input
                  type="number"
                  required
                  min={currentBid + 1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isLoggedIn ? (
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Submit Bid
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Login to Bid
                  </button>
                )}
              </form>
            )}

            {/* Timer */}
            {item.active && (
              <div className="mt-6 text-sm text-gray-500">
                Ends on: {new Date(item.endDate).toLocaleString()}
              </div>
            )}

            {error && (
              <div className="mt-4 text-center text-red-600 font-medium">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Items;
