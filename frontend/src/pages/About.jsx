import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = ({ isLoggedIn, user }) => {
  useEffect(() => {
    document.title = "eMarket | About Us";
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} user={user} />

      {/* About Section */}
      <section className="container mx-auto px-6 py-16 text-center flex-1">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          About eMarket
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
          Welcome to{" "}
          <strong className="text-blue-600">eMarket</strong> — an online
          auction platform designed to connect buyers and sellers. Whether
          you’re looking to buy rare collectibles or sell your items to the
          highest bidder, eMarket makes the process simple, secure, and fun.
        </p>
      </section>

      {/* Creator Card */}
      <section className="flex justify-center items-center pb-16">
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 text-center w-full max-w-sm">
          <img
            src="/logo/about-img.png"
            alt="Profile"
            className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 mb-4"
          />
          <h3 className="text-xl font-semibold">Sarthak</h3>
          <p className="text-gray-500 mb-4">Developer & Creator</p>

          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/Sarthacker"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sarthak-kumar-singh-6bb4ab258"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
