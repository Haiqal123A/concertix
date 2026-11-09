import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const isHome = location.pathname === "/";
  const isOrders = location.pathname === "/orders";
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  // =====================================================
  // ACTIVE SECTION
  // =====================================================

  useEffect(() => {
    setActiveSection(location.hash.replace("#", ""));
  }, [location.hash]);

  // =====================================================
  // CLOSE MOBILE
  // =====================================================

  const closeMobile = () => {
    setMobileOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // HOME
  // =====================================================

  const goHome = () => {
    closeMobile();

    setActiveSection("");

    navigate("/", {
      replace: false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SECTION NAVIGATION
  // =====================================================

  const goToSection = (section) => {
    closeMobile();

    setActiveSection(section);

    // Kalau bukan Home
    if (!isHome) {
      navigate(`/#${section}`);
      return;
    }

    // Kalau sudah di Home
    const element = document.getElementById(section);

    if (element) {
      // update URL hash
      window.history.pushState(null, "", `/#${section}`);

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const navItemClass = (active) => `
    group relative
    rounded-xl
    px-4 py-2.5
    text-sm font-bold
    transition-all duration-300
    ${
      active
        ? "text-slate-950"
        : "text-slate-500 hover:text-slate-950"
    }
  `;

  return (
    <header className="fixed left-0 right-0 top-0 z-50">

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[500px] -translate-x-1/2 bg-violet-400/10 blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">

        <nav
          className="
            rounded-[22px]
            border border-white/70
            bg-white/80
            px-5 py-3
            shadow-[0_10px_40px_rgba(15,23,42,0.07)]
            backdrop-blur-2xl
            sm:px-6
          "
        >

          {/* =====================================================
              MAIN NAVBAR
          ===================================================== */}

          <div className="flex items-center justify-between">

            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"
              onClick={closeMobile}
              className="group flex items-center gap-3"
            >

              <div
                className="
                  relative flex h-10 w-10
                  items-center justify-center
                  overflow-hidden rounded-xl
                  bg-slate-950
                  text-sm font-black text-white
                  shadow-[0_8px_25px_rgba(15,23,42,0.18)]
                  transition-all duration-300
                  group-hover:-rotate-3
                  group-hover:scale-105
                  group-hover:bg-violet-600
                "
              >
                <span className="relative z-10">
                  C
                </span>

                <div
                  className="
                    absolute -right-3 -top-3
                    h-8 w-8
                    rounded-full
                    bg-violet-500/40
                    blur-md
                  "
                />
              </div>

              <div className="leading-none">

                <p className="text-[15px] font-black tracking-tight text-slate-950">
                  CONCERT
                  <span className="text-violet-600">
                    IX
                  </span>
                </p>

                <p className="mt-1 hidden text-[8px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:block">
                  Live the moment
                </p>

              </div>

            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <div className="hidden items-center gap-1 md:flex">

              {/* HOME */}

              <button
                onClick={goHome}
                className={navItemClass(
                  isHome && !activeSection
                )}
              >
                Home

                <span
                  className={`
                    absolute bottom-0 left-1/2
                    h-[3px]
                    -translate-x-1/2
                    rounded-full
                    bg-violet-600
                    transition-all duration-300
                    ${
                      isHome && !activeSection
                        ? "w-6 opacity-100"
                        : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                    }
                  `}
                />
              </button>

              {/* EXPLORE */}

              <button
                onClick={() => goToSection("explore")}
                className={navItemClass(
                  activeSection === "explore"
                )}
              >
                Explore

                <span
                  className={`
                    absolute bottom-0 left-1/2
                    h-[3px]
                    -translate-x-1/2
                    rounded-full
                    bg-violet-600
                    transition-all duration-300
                    ${
                      activeSection === "explore"
                        ? "w-6 opacity-100"
                        : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                    }
                  `}
                />
              </button>

              {/* WHY */}

              <button
                onClick={() => goToSection("why")}
                className={navItemClass(
                  activeSection === "why"
                )}
              >
                Why Concertix

                <span
                  className={`
                    absolute bottom-0 left-1/2
                    h-[3px]
                    -translate-x-1/2
                    rounded-full
                    bg-violet-600
                    transition-all duration-300
                    ${
                      activeSection === "why"
                        ? "w-6 opacity-100"
                        : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                    }
                  `}
                />
              </button>

              {/* ORDERS */}

              {token && (
                <Link
                  to="/orders"
                  className={navItemClass(isOrders)}
                >
                  My Orders

                  <span
                    className={`
                      absolute bottom-0 left-1/2
                      h-[3px]
                      -translate-x-1/2
                      rounded-full
                      bg-violet-600
                      transition-all duration-300
                      ${
                        isOrders
                          ? "w-6 opacity-100"
                          : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                      }
                    `}
                  />
                </Link>
              )}

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="hidden items-center gap-2 md:flex">

              {token && user ? (

                <>
                  {/* USER */}

                  <div
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-slate-200/80
                      bg-slate-50/80
                      px-3 py-2
                      transition-all duration-300
                      hover:border-violet-200
                      hover:bg-violet-50/60
                    "
                  >

                    <div
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-violet-500
                        via-purple-500
                        to-fuchsia-500
                        text-xs font-black text-white
                        shadow-lg shadow-violet-500/20
                      "
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="max-w-[120px]">

                      <p className="truncate text-xs font-black text-slate-900">
                        {user.name || "User"}
                      </p>

                      <p className="mt-0.5 text-[10px] capitalize text-slate-400">
                        {user.role || "user"}
                      </p>

                    </div>

                  </div>

                  {/* ADMIN DASHBOARD - Jika user adalah admin */}
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="
                        rounded-xl
                        border border-violet-200
                        bg-violet-50
                        px-4 py-2.5
                        text-sm font-bold
                        text-violet-600
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:border-violet-300
                        hover:bg-violet-100
                      "
                    >
                      🔐 Admin Dashboard
                    </Link>
                  )}

                  {/* LOGOUT */}

                  <button
                    onClick={logout}
                    className="
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-4 py-2.5
                      text-sm font-bold
                      text-slate-600
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:border-red-200
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    Logout
                  </button>
                </>

              ) : (

                <>
                  {/* REGISTER */}

                  <Link
                    to="/register"
                    className={`
                      rounded-xl
                      px-4 py-2.5
                      text-sm font-bold
                      transition-all duration-300
                      ${
                        isRegister
                          ? "bg-violet-50 text-violet-600 ring-1 ring-violet-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-violet-600"
                      }
                    `}
                  >
                    Register
                  </Link>

                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className={`
                      rounded-xl
                      px-5 py-2.5
                      text-sm font-bold
                      transition-all duration-300
                      ${
                        isLogin
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                          : "bg-slate-950 text-white shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-violet-600"
                      }
                    `}
                  >
                    Login
                  </Link>
                </>

              )}

            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-700
                transition-all duration-300
                hover:border-violet-300
                hover:bg-violet-50
                hover:text-violet-600
                md:hidden
              "
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span
                className={`text-lg transition-transform duration-300 ${
                  mobileOpen ? "rotate-90" : ""
                }`}
              >
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>

          </div>

          {/* =====================================================
              MOBILE MENU
          ===================================================== */}

          {mobileOpen && (
            <div className="mt-4 border-t border-slate-200/80 pt-4 md:hidden">

              <div className="grid gap-2">

                {/* HOME */}

                <button
                  onClick={goHome}
                  className={`
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-left
                    text-sm font-bold
                    transition-all duration-300
                    ${
                      isHome && !activeSection
                        ? "bg-slate-950 text-white shadow-lg"
                        : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                    }
                  `}
                >
                  <span>⌂</span>
                  Home
                </button>

                {/* EXPLORE */}

                <button
                  onClick={() => goToSection("explore")}
                  className={`
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-left
                    text-sm font-bold
                    transition-all duration-300
                    ${
                      activeSection === "explore"
                        ? "bg-slate-950 text-white shadow-lg"
                        : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                    }
                  `}
                >
                  <span>✦</span>
                  Explore
                </button>

                {/* WHY */}

                <button
                  onClick={() => goToSection("why")}
                  className={`
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-left
                    text-sm font-bold
                    transition-all duration-300
                    ${
                      activeSection === "why"
                        ? "bg-slate-950 text-white shadow-lg"
                        : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                    }
                  `}
                >
                  <span>◈</span>
                  Why Concertix
                </button>

                {/* ORDERS */}

                {token && (
                  <Link
                    to="/orders"
                    onClick={closeMobile}
                    className={`
                      flex items-center gap-3
                      rounded-xl px-4 py-3
                      text-sm font-bold
                      transition-all duration-300
                      ${
                        isOrders
                          ? "bg-slate-950 text-white shadow-lg"
                          : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                      }
                    `}
                  >
                    <span>◎</span>
                    My Orders
                  </Link>
                )}

                <div className="my-2 h-px bg-slate-200" />

                {/* USER */}

                {token && user ? (

                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

                      <div
                        className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-violet-500
                          to-fuchsia-500
                          font-black text-white
                        "
                      >
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>

                        <p className="text-sm font-black text-slate-900">
                          {user.name || "User"}
                        </p>

                        <p className="text-xs capitalize text-slate-400">
                          {user.role || "user"}
                        </p>

                      </div>

                    </div>

                    {/* ADMIN DASHBOARD - Mobile */}
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={closeMobile}
                        className="
                          flex items-center gap-3
                          rounded-xl
                          bg-violet-50
                          px-4 py-3
                          text-left
                          text-sm font-bold
                          text-violet-600
                          transition-all duration-300
                          hover:bg-violet-100
                        "
                      >
                        <span>🔐</span>
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="
                        flex items-center gap-3
                        rounded-xl
                        bg-red-50
                        px-4 py-3
                        text-left
                        text-sm font-bold
                        text-red-500
                        transition-all duration-300
                        hover:bg-red-100
                      "
                    >
                      <span>↪</span>
                      Logout
                    </button>
                  </>

                ) : (

                  <>
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="
                        flex items-center justify-center
                        rounded-xl
                        border border-slate-200
                        bg-white
                        px-4 py-3
                        text-sm font-bold
                        text-slate-700
                        transition-all duration-300
                        hover:border-violet-300
                        hover:bg-violet-50
                        hover:text-violet-600
                      "
                    >
                      Create Account
                    </Link>

                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="
                        flex items-center justify-center
                        rounded-xl
                        bg-slate-950
                        px-4 py-3
                        text-sm font-bold
                        text-white
                        transition-all duration-300
                        hover:bg-violet-600
                      "
                    >
                      Login
                    </Link>
                  </>

                )}

              </div>
            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Navbar;