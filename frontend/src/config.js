// API base URL - set VITE_API_URL in Vercel environment variables
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function to get full image URL from backend
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // Already a full URL
  return `${API_URL}${imagePath}`; // Prepend API_URL to relative path
};

// Helper function to make API calls
export const api = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers["Content-Type"];
  }
  
  return fetch(url, { ...defaultOptions, ...options });
};