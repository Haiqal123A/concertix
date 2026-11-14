import { Link, NavLink, useNavigate } from "react-router-dom";
import { useConfirmation } from "../useConfirmation";
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
  { label: "Jenis Tiket", path: "/admin/ticket-types", icon: Ticket },
  { label: "Scan Tiket", path: "/admin/ticket-scanner", icon: QrCode },
  { label: "Pembayaran", path: "/admin/payments", icon: CreditCard },
];

function AdminNavbar() {
  const navigate = useNavigate();
  const confirm = useConfirmation();

  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout dari admin?",
      message: "Kamu akan keluar dari sesi admin.",
      confirmLabel: "Logout",
    });
    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const linkClass = (active) => `
    group relative rounded-xl px-3 py-2.5 text-sm font-semibold
    transition-all duration-300
    ${
      active
        ? "bg-violet-50 text-violet-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }
  `;

  const renderMenuItems = () =>
    menuItems.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === "/admin"}
        className={({ isActive }) =>
          `flex shrink-0 items-center gap-2 ${linkClass(isActive)}`
        }
      >
        <Icon size={16} strokeWidth={1.9} />
        <span>{label}</span>
      </NavLink>
    ));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[500px] -translate-x-1/2 bg-violet-400/10 blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_12px_38px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/admin"
              aria-label="Concertix admin dashboard"
              className="group flex shrink-0 items-center gap-3"
            >
              <img
                src="/concertix-mark.svg"
                alt=""
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[15px] font-black tracking-tight text-slate-950">
                CONCERT<span className="text-violet-600">IX</span>
              </span>
            </Link>

            <nav
              aria-label="Navigasi admin"
              className="hidden items-center gap-1 xl:flex"
            >
              {renderMenuItems()}
            </nav>

            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-xs font-black text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
                <span className="max-w-[120px]">
                  <span className="block truncate text-xs font-bold text-slate-900">
                    {user?.name || "Admin"}
                  </span>
                  <span className="mt-0.5 block text-[10px] capitalize text-slate-400">
                    {user?.role || "admin"}
                  </span>
                </span>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <ArrowUpRight size={16} />
                Website
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                Logout
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-1 xl:hidden">
              <Link
                to="/"
                aria-label="Lihat website"
                title="Lihat website"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <ArrowUpRight size={18} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <nav
        aria-label="Navigasi admin mobile"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 px-1">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold ${
                  isActive ? "text-violet-700" : "text-slate-500"
                }`
              }
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default AdminNavbar;
