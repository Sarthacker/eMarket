import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/logo/logo.png"
            alt="eMarket Logo"
            className="w-30 h-10"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <span className="text-gray-600">
                Welcome, <strong>{user?.username}</strong>
              </span>

              <Link
                to="/create"
                className="text-gray-600 hover:text-blue-600"
              >
                Create Listing
              </Link>

              <Link
                to="/my-listings"
                className="text-gray-600 hover:text-blue-600"
              >
                My Listings
              </Link>

              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600"
              >
                About Us
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                About Us
              </Link>

              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
