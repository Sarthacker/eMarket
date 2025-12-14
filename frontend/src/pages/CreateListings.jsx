import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";

function CreateListing(){
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    document.title = "eMarket | Create Listing";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingBid: "",
    endDate: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });

      const res = await fetch("/api/listings", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to create listing");
        return;
      }

      navigate("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar />

      <section className="max-w-3xl mx-auto mt-12 bg-white shadow-md rounded-2xl p-8 w-full">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Create a New Auction Listing
        </h2>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Item Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Starting Bid (₹)
            </label>
            <input
              type="number"
              name="startingBid"
              min="0"
              required
              value={formData.startingBid}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Auction End Date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Upload Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 bg-gray-50"
            />
          </div>

          <div className="text-center">
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default CreateListing;
