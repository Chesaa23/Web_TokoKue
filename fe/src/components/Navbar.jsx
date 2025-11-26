import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-pink-600 font-semibold"
      : "text-gray-700";

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-pink-600">
          TokoKue
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className={isActive("/")}>
            Produk
          </Link>
          <Link to="/cart" className={isActive("/cart")}>
            Keranjang
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className={isActive("/admin")}>
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="text-xs text-gray-600">
                {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs px-3 py-1 rounded border border-pink-500 text-pink-500 hover:bg-pink-50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
