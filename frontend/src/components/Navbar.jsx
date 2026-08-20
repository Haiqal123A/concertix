import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("USER SESSION ERROR:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-white transition hover:text-violet-400"
        >
          Concert<span className="text-violet-500">ix</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* HOME */}
          <Link
            to="/"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive("/")
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Home
          </Link>

          {/* BELUM LOGIN */}
          {!user && (
            <>
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive("/login")
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-violet-100"
              >
                Register
              </Link>
            </>
          )}

          {/* USER */}
          {user && user.role === "user" && (
            <>
              <span className="hidden text-sm text-neutral-400 sm:block">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-violet-100"
              >
                Logout
              </button>
            </>
          )}

          {/* ADMIN */}
          {user && user.role === "admin" && (
            <>
              <Link
                to="/admin"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith("/admin")
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                Admin Panel
              </Link>

              <span className="hidden text-sm text-neutral-400 sm:block">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-violet-100"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;