import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRef = useRef(null);

  // =========================================================
  // GET USER SESSION
  // =========================================================

  useEffect(() => {
    const loadUser = () => {
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
    };

    loadUser();
  }, [location]);

  // =========================================================
  // CLOSE PROFILE WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // ACTIVE STATE
  // =========================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // =========================================================
  // EXPLORE
  // =========================================================

  const handleExplore = () => {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document
          .getElementById("explore")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } else {
      document
        .getElementById("explore")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);

    navigate("/login");
  };

  // =========================================================
  // USER INITIAL
  // =========================================================

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-2xl border border-white/[0.08] bg-neutral-950/75 shadow-2xl shadow-black/20 backdrop-blur-2xl">

            {/* subtle gradient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />

              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-fuchsia-600/10 blur-3xl" />
            </div>

            <div className="relative flex h-[70px] items-center justify-between px-4 sm:px-6">

              {/* =================================================
                  LOGO
              ================================================= */}

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center gap-2"
              >
                {/* Logo Icon */}

                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-violet-500/20 transition duration-300 group-hover:scale-105 group-hover:shadow-violet-500/40">
                  <div className="absolute inset-[1px] rounded-[10px] bg-neutral-950/20" />

                  <span className="relative text-lg font-black text-white">
                    C
                  </span>
                </div>

                {/* Logo Text */}

                <div className="leading-none">
                  <p className="text-[19px] font-black tracking-tight text-white">
                    Concert
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      ix
                    </span>
                  </p>

                  <p className="mt-1 hidden text-[8px] font-semibold uppercase tracking-[0.25em] text-neutral-500 sm:block">
                    Live the moment
                  </p>
                </div>
              </Link>

              {/* =================================================
                  DESKTOP NAVIGATION
              ================================================= */}

              <div className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 md:flex">

                {/* HOME */}

                <Link
                  to="/"
                  className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive("/")
                      ? "text-white"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {isActive("/") && (
                    <span className="absolute inset-0 -z-10 rounded-lg bg-white/[0.08]" />
                  )}

                  <span className="relative">
                    Home
                  </span>
                </Link>

                {/* EXPLORE */}

                <button
                  onClick={handleExplore}
                  className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    location.hash === "#explore"
                      ? "text-white"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  <span className="mr-2 text-xs text-violet-400">
                    ✦
                  </span>

                  Explore
                </button>

                {/* MY ORDERS */}

                {user?.role === "user" && (
                  <Link
                    to="/orders"
                    className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      isActive("/orders")
                        ? "text-white"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {isActive("/orders") && (
                      <span className="absolute inset-0 -z-10 rounded-lg bg-white/[0.08]" />
                    )}

                    <span className="mr-2 text-xs text-violet-400">
                      ◈
                    </span>

                    My Orders
                  </Link>
                )}

                {/* ADMIN */}

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      location.pathname.startsWith("/admin")
                        ? "text-white"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {location.pathname.startsWith("/admin") && (
                      <span className="absolute inset-0 -z-10 rounded-lg bg-violet-500/10" />
                    )}

                    <span className="mr-2 text-xs text-violet-400">
                      ◆
                    </span>

                    Admin
                  </Link>
                )}
              </div>

              {/* =================================================
                  RIGHT SIDE
              ================================================= */}

              <div className="flex items-center gap-2">

                {/* NOT LOGGED IN */}

                {!user && (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link
                      to="/login"
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-400 transition hover:text-white"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="group relative overflow-hidden rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-100"
                    >
                      <span className="relative z-10">
                        Get Started
                      </span>
                    </Link>
                  </div>
                )}

                {/* LOGGED IN */}

                {user && (
                  <div
                    ref={profileRef}
                    className="relative hidden sm:block"
                  >
                    <button
                      onClick={() =>
                        setProfileOpen((prev) => !prev)
                      }
                      className={`flex items-center gap-3 rounded-xl border px-2 py-1.5 transition-all duration-300 ${
                        profileOpen
                          ? "border-violet-500/30 bg-violet-500/10"
                          : "border-white/[0.07] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                      }`}
                    >
                      {/* Avatar */}

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-black text-white shadow-lg shadow-violet-500/20">
                        {userInitial}
                      </div>

                      {/* Name */}

                      <div className="hidden text-left lg:block">
                        <p className="max-w-[110px] truncate text-xs font-semibold text-white">
                          {user.name}
                        </p>

                        <p className="mt-0.5 text-[10px] capitalize text-neutral-500">
                          {user.role}
                        </p>
                      </div>

                      {/* Arrow */}

                      <span
                        className={`text-xs text-neutral-500 transition-transform duration-300 ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================= */}

                    {profileOpen && (
                      <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">

                        {/* Profile Header */}

                        <div className="mb-2 rounded-xl bg-white/[0.04] p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">
                              {userInitial}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {user.name}
                              </p>

                              <p className="truncate text-xs text-neutral-500">
                                {user.email || "Concertix User"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu */}

                        {user.role === "user" && (
                          <Link
                            to="/orders"
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-violet-400">
                              ◈
                            </span>

                            <div>
                              <p className="font-medium">
                                My Orders
                              </p>

                              <p className="text-[11px] text-neutral-600">
                                View your tickets
                              </p>
                            </div>
                          </Link>
                        )}

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-violet-400">
                              ◆
                            </span>

                            <div>
                              <p className="font-medium">
                                Admin Panel
                              </p>

                              <p className="text-[11px] text-neutral-600">
                                Manage Concertix
                              </p>
                            </div>
                          </Link>
                        )}

                        <div className="my-2 h-px bg-white/[0.06]" />

                        {/* Logout */}

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/5">
                            ↪
                          </span>

                          <div>
                            <p className="font-medium">
                              Logout
                            </p>

                            <p className="text-[11px] text-neutral-600">
                              Sign out from Concertix
                            </p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    MOBILE BUTTON
                ================================================= */}

                <button
                  onClick={() =>
                    setMobileOpen((prev) => !prev)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-neutral-300 transition hover:bg-white/[0.08] hover:text-white md:hidden"
                  aria-label="Toggle menu"
                >
                  <div className="flex w-5 flex-col gap-1.5">
                    <span
                      className={`h-[2px] w-full rounded-full bg-current transition duration-300 ${
                        mobileOpen
                          ? "translate-y-[4px] rotate-45"
                          : ""
                      }`}
                    />

                    <span
                      className={`h-[2px] w-full rounded-full bg-current transition duration-300 ${
                        mobileOpen
                          ? "-rotate-45"
                          : ""
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* =====================================================
                MOBILE MENU
            ===================================================== */}

            {mobileOpen && (
              <div className="border-t border-white/[0.07] px-4 pb-4 pt-3 md:hidden">
                <div className="space-y-1">

                  {/* Home */}

                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                      isActive("/")
                        ? "bg-white/[0.08] text-white"
                        : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="text-base">
                      ⌂
                    </span>

                    Home
                  </Link>

                  {/* Explore */}

                  <button
                    onClick={handleExplore}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="text-base text-violet-400">
                      ✦
                    </span>

                    Explore Concerts
                  </button>

                  {/* Orders */}

                  {user?.role === "user" && (
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                        isActive("/orders")
                          ? "bg-white/[0.08] text-white"
                          : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <span className="text-base text-violet-400">
                        ◈
                      </span>

                      My Orders
                    </Link>
                  )}

                  {/* Admin */}

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <span className="text-base text-violet-400">
                        ◆
                      </span>

                      Admin Panel
                    </Link>
                  )}

                  {/* Divider */}

                  <div className="my-2 h-px bg-white/[0.06]" />

                  {/* Not logged in */}

                  {!user && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl border border-white/[0.08] px-4 py-3 text-center text-sm font-medium text-neutral-300 transition hover:bg-white/[0.05]"
                      >
                        Login
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-neutral-950 transition hover:bg-violet-100"
                      >
                        Register
                      </Link>
                    </div>
                  )}

                  {/* User */}

                  {user && (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">
                          {userInitial}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {user.name}
                          </p>

                          <p className="text-xs capitalize text-neutral-500">
                            {user.role}
                          </p>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="rounded-lg p-2 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          ↪
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;