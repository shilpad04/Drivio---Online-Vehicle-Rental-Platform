import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar({ searchQuery, setSearchQuery }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isRenterOrGuest = !user || user.role === "RENTER";
  const isOwnerOrAdmin = isAdmin || isOwner;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
    setOpen(false);
  };

  const openRegister = () => {
    setAuthTab("register");
    setAuthOpen(true);
    setOpen(false);
  };

  useEffect(() => {
    if (location.state?.openAuthModal === "register") {
      openRegister();
      navigate(location.pathname, { replace: true });
    }

    if (location.state?.openAuthModal === "login") {
      openLogin();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const goToDashboard = () => {
    setDropdownOpen(false);

    if (user.role === "RENTER") navigate("/dashboard/renter");
    if (user.role === "OWNER") navigate("/dashboard/owner");
    if (user.role === "ADMIN") navigate("/dashboard/admin");
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all ${
          scrolled ? "bg-white shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
          <div className="flex items-center">
            <i className="fa-solid fa-car-side text-blue-600 text-2xl"></i>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              Drivio
            </span>
          </div>

          {isRenterOrGuest && (
            <div className="hidden lg:flex mx-auto">
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle or location"
                  className="bg-transparent px-4 py-2 outline-none text-sm w-56"
                />
                <button className="px-4 text-gray-600">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-6">
            {isOwnerOrAdmin && (
              <Link
                to="/how-it-works"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                How It Works
              </Link>
            )}

            {isRenterOrGuest && (
              <ul className="hidden md:flex gap-8 text-sm font-medium">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/vehicles">Vehicles</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
              </ul>
            )}

            {!isAuthenticated ? (
              <div className="hidden md:flex gap-6 text-sm font-medium">
                <button onClick={openLogin}>Login</button>
                <button className="text-blue-600 font-semibold" onClick={openRegister}>
                  Register
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white"
                >
                  <i className="fa-solid fa-user"></i>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg text-sm">
                    <button
                      onClick={goToDashboard}
                      className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button className="md:hidden text-xl" onClick={() => setOpen(!open)}>
              <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
            </button>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}
