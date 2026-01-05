import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { API_URL, getImageUrl } from "../config";
import {PropagateLoader} from 'react-spinners';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    document.title = "eMarket | Edit Listing";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingBid: "",
    endDate: "",
    image: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${API_URL}/api/listings/${id}/edit`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/cannot-edit");
          return;
        }

        if (res.status === 404) {
          navigate("/no-item");
          return;
        }

        const data = await res.json();

        setFormData({
          name: data.item.name,
          description: data.item.description,
          startingBid: data.item.startingBid,
          endDate: new Date(data.item.endDate).toISOString().slice(0, 16),
          image: null,
        });

        setCurrentImage(data.item.image);
      } catch {
        setError("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });

      const res = await fetch(`${API_URL}/api/listings/${id}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      if (res.status === 401) {
        navigate("/cannot-edit");
        return;
      }

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Update failed");
        return;
      }

      navigate(`/item/${id}`);
    } catch {
      setError("Something went wrong");
    }
  };

  if (loading) {
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

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar />

      <section className="container mx-auto px-4 py-12 flex-1">
        <div className="bg-white shadow-md rounded-2xl p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-purple-600 mb-8">
            Edit Your Listing
          </h1>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-semibold mb-2">Item Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Starting Bid */}
            <div>
              <label className="block font-semibold mb-2">
                Starting Bid (₹)
              </label>
              <input
                type="number"
                name="startingBid"
                required
                value={formData.startingBid}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* End Date */}
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
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-semibold mb-2">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-2">
                Upload a new image (optional)
              </p>
            </div>

            {/* Preview */}
            <div className="text-center mt-6">
              <img
                src={preview || getImageUrl(currentImage)}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg mx-auto shadow-md"
              />
              <p className="text-gray-500 text-sm mt-2">
                {preview ? "New image preview" : "Current image"}
              </p>
            </div>

            {/* Submit */}
            <div className="text-center mt-8">
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EditItem;
