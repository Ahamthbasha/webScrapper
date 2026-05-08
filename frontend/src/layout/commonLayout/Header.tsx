import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUserDetails } from "../../redux/slices/userSlice";
import { logout as logoutAPI } from "../../api/auth/userAuth";
import { toast } from "react-toastify";
import type { RootState } from "../../redux/store";
import { LogOut, User, Menu, X, Bookmark, Newspaper, Rss } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(clearUserDetails());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center space-x-2 focus:outline-none rounded-lg p-1"
          >
            <Rss className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold text-white">
              HN<span className="text-emerald-400">Scraper</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Stories — visible to everyone */}
            <Link
              to="/stories"
              className="flex items-center space-x-1.5 px-3 py-2 text-gray-300 hover:text-emerald-400 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
            >
              <Newspaper className="h-4 w-4" />
              <span>Stories</span>
            </Link>

            {isLoggedIn ? (
              <>
                {/* Bookmarks — only logged-in users */}
                <Link
                  to="/bookmarks"
                  className="flex items-center space-x-1.5 px-3 py-2 text-gray-300 hover:text-emerald-400 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Bookmarks</span>
                </Link>

                {/* User avatar */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 ml-1">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors ml-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-600 hover:bg-emerald-600 hover:text-white rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {/* Stories — always visible */}
          <Link
            to="/stories"
            onClick={closeMobileMenu}
            className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-emerald-400 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
          >
            <Newspaper className="h-5 w-5" />
            <span>Stories</span>
          </Link>

          {isLoggedIn ? (
            <>
              {/* User info */}
              <div className="flex items-center space-x-3 px-3 py-3 border-b border-slate-800 mb-1">
                <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name || "User"}</p>
                  <p className="text-xs text-gray-400">{user.email || ""}</p>
                </div>
              </div>

              <Link
                to="/bookmarks"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-emerald-400 hover:bg-slate-800 rounded-md text-sm font-medium transition-colors"
              >
                <Bookmark className="h-5 w-5" />
                <span>Bookmarks</span>
              </Link>

              <button
                onClick={() => { handleLogout(); closeMobileMenu(); }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors mt-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 px-3 py-2 text-emerald-400 border border-emerald-600 rounded-md text-sm font-medium transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors"
              >
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;