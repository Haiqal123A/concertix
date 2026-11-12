import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Music2,
  QrCode,
  Ticket,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Konser", path: "/admin/concerts", icon: Music2 },
  { label: "Ticket Types", path: "/admin/ticket-types", icon: Ticket },
  { label: "Scan Tiket", path: "/admin/ticket-scanner", icon: QrCode },
  { label: "Pembayaran", path: "/admin/payments", icon: CreditCard },
];

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Apakah kamu yakin ingin logout?");

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="admin-navbar sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 px-4 sm:px-6 xl:flex-nowrap xl:px-8">
        <div className="flex h-[68px] w-full shrink-0 items-center justify-between xl:h-[76px] xl:w-auto">
          <Link
            to="/admin"
            className="group flex items-center gap-2.5"
            aria-label="Concertix admin dashboard"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-200 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Music2 size={20} strokeWidth={2.2} />
            </span>
            <span className="admin-brand-wordmark text-[21px] font-bold leading-none text-slate-900">
              concertix<span className="text-violet-600">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 xl:hidden">
            <Link
              to="/"
              aria-label="Lihat website"
              title="Lihat website"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <ArrowUpRight size={18} />
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <nav
          aria-label="Navigasi admin"
          className="admin-nav-scroller order-2 -mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2.5 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 xl:order-none xl:mx-0 xl:w-auto xl:flex-1 xl:justify-center xl:gap-1.5 xl:overflow-visible xl:border-0 xl:px-0 xl:py-0"
        >
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-1 border-l border-slate-200 pl-5 xl:flex">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowUpRight size={16} />
            <span>Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
