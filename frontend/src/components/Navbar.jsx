import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useConfirmation } from "./useConfirmation";
import {
  Compass,
  House,
  LogOut,
  Shield,
  Ticket,
  UserRound,
} from "lucide-react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirmation();

  const [accountOpen, setAccountOpen] = useState(false);
  const activeSection = location.hash.replace("#", "");

  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  const user = (() => {
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  })();

  const isHome = location.pathname === "/";
  const isConcerts = location.pathname === "/concerts";
  const isOrders = location.pathname === "/orders";
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  // =====================================================
  // CLOSE MOBILE
  // =====================================================

  const closeMobile = () => {
    setAccountOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    const confirmed = await confirm({
      title: "Keluar dari akun?",
      message: "Kamu perlu masuk kembali untuk mengakses akun.",
      confirmLabel: "Logout",
    });
    if (!confirmed) return;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setAccountOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // HOME
  // =====================================================

  const goHome = () => {
    closeMobile();

    navigate("/", {
      replace: false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const navItemClass = (active) => `
    group relative
    rounded-xl
    px-4 py-2.5
    text-sm font-semibold
    transition-all duration-300
    ${
      active
        ? "bg-violet-50 text-violet-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }
  `;

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-50">

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[500px] -translate-x-1/2 bg-violet-400/10 blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">

        <nav
          className="
            rounded-2xl
            border border-slate-200/80
            bg-white/90
            px-4 py-3
            shadow-[0_12px_38px_rgba(15,23,42,0.06)]
            backdrop-blur-2xl
            sm:px-5
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
                  overflow-hidden rounded-[14px]
                  bg-violet-700
                  text-sm font-black text-white
                  shadow-[0_8px_25px_rgba(15,23,42,0.18)]
                  transition-all duration-300
                  group-hover:-rotate-3
                  group-hover:scale-105
                  group-hover:bg-slate-950
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

              <Link
                to="/concerts"
                onClick={closeMobile}
                className={navItemClass(isConcerts)}
              >
                Semua Konser
              </Link>

              {/* ORDERS */}

              {token && (
                <Link
                  to="/orders"
                  className={navItemClass(isOrders)}
                >
                  My Order

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

          </div>

        </nav>
      </div>
    </header>

    <nav
      aria-label="Navigasi mobile"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
    >
      {accountOpen && token && user && (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-black text-white">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user.name || "User"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user.role || "user"}
              </p>
            </div>
          </div>

          {user.role === "admin" && (
            <Link
              to="/admin"
              onClick={closeMobile}
              className="mt-2 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-700"
            >
              <Shield size={17} />
              Admin Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-left text-sm font-semibold text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}

      <div
        className={`mx-auto grid max-w-xl px-2 ${
          token && user ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        <button
          type="button"
          onClick={goHome}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
            isHome && !activeSection
              ? "text-violet-700"
              : "text-slate-500"
          }`}
        >
          <House size={19} />
          Home
        </button>

        <Link
          to="/concerts"
          onClick={closeMobile}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
            isConcerts ? "text-violet-700" : "text-slate-500"
          }`}
        >
          <Compass size={19} />
          Konser
        </Link>

        {token && user ? (
          <>
            <Link
              to="/orders"
              onClick={closeMobile}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
                isOrders ? "text-violet-700" : "text-slate-500"
              }`}
            >
              <Ticket size={19} />
              Pesanan
            </Link>

            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
                accountOpen ? "text-violet-700" : "text-slate-500"
              }`}
            >
              <UserRound size={19} />
              Akun
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={closeMobile}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
              isLogin ? "text-violet-700" : "text-slate-500"
            }`}
          >
            <UserRound size={19} />
            Login
          </Link>
        )}
      </div>
    </nav>
    </>
  );
}

export default Navbar;