import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/");
    }
  };

  // Helper function for nav link styling
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-purple-600 font-semibold"
      : "text-gray-600 hover:text-purple-600";

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-2">
          <img
            src="/logo/logo.png"
            alt="eMarket Logo"
            className="w-auto h-10"
          />
        </NavLink>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <span className="text-gray-600">
                Welcome, <strong>{user?.username}</strong>
              </span>

              <NavLink
                to="/create"
                className={navLinkClass}
              >
                Create Listing
              </NavLink>

              <NavLink
                to="/my-listings"
                className={navLinkClass}
              >
                My Listings
              </NavLink>

              <NavLink
                to="/about"
                className={navLinkClass}
              >
                About Us
              </NavLink>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "text-purple-600 font-semibold"
                    : "text-gray-600 hover:text-purple-600 font-medium"
                }
              >
                About Us
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "bg-purple-700 text-white px-4 py-2 rounded-lg"
                    : "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-700 text-white px-4 py-2 rounded-lg"
                    : "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;