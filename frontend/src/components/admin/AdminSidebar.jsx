import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Mic2,
  Music2,
  Tags,
  Ticket,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Konser", path: "/admin/concerts", icon: Music2 },
  { label: "Artist", path: "/admin/artists", icon: Mic2 },
  { label: "Category", path: "/admin/categories", icon: Tags },
  { label: "Venue", path: "/admin/venues", icon: MapPin },
  { label: "Ticket Types", path: "/admin/ticket-types", icon: Ticket },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Apakah kamu yakin ingin logout?");

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const renderMenuItems = (onNavigate) =>
    menuItems.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === "/admin"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
            isActive
              ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
              : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
          }`
        }
      >
        <Icon size={18} strokeWidth={1.8} />
        <span>{label}</span>
      </NavLink>
    ));

  const renderBrand = () => (
    <Link to="/admin" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-200">
        C
      </span>
      <span>
        <span className="block text-base font-black tracking-tight text-slate-900">
          Concertix
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
          Admin studio
        </span>
      </span>
    </Link>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 shadow-sm lg:flex">
        <div className="flex h-20 items-center border-b border-slate-100 px-2">
          {renderBrand()}
        </div>

        <div className="flex-1 overflow-y-auto py-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Management
          </p>
          <nav className="space-y-1">{renderMenuItems()}</nav>
        </div>

        <div className="space-y-1 border-t border-slate-100 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowUpRight size={18} strokeWidth={1.8} />
            <span>Lihat Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          {renderBrand()}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="admin-mobile-menu" className="border-t border-slate-100 pb-1 pt-4">
            <nav className="grid gap-1 sm:grid-cols-2">
              {renderMenuItems(() => setMobileMenuOpen(false))}
            </nav>
            <div className="mt-3 grid gap-1 border-t border-slate-100 pt-3 sm:grid-cols-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowUpRight size={18} strokeWidth={1.8} />
                <span>Lihat Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut size={18} strokeWidth={1.8} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default AdminSidebar;
