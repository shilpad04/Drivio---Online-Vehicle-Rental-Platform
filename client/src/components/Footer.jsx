import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  const contactLink =
    user?.role === "ADMIN"
      ? "/dashboard/admin/inquiries"
      : "/contact";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center mb-4">
            <i className="fa-solid fa-car-side text-blue-500 text-xl"></i>
            <span
              className="ml-2 text-xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Drivio
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Smart, flexible vehicle rentals from trusted local owners.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to={contactLink}
                className="hover:underline"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-semibold text-white mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/vehicles" className="hover:underline">
                Vehicles
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:underline">
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold text-white mb-3">Follow</h4>
          <div className="flex gap-4 text-lg">
            <i className="fa-brands fa-facebook cursor-pointer"></i>
            <i className="fa-brands fa-instagram cursor-pointer"></i>
            <i className="fa-brands fa-linkedin cursor-pointer"></i>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center text-sm py-4 text-gray-500">
        © 2025 Drivio. All rights reserved.
      </div>
    </footer>
  );
}
