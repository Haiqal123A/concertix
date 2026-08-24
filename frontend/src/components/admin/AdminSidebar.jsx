import { NavLink, Link, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "▦",
    },
    {
      label: "Konser",
      path: "/admin/concerts",
      icon: "♫",
    },
    {
      label: "Artist",
      path: "/admin/artists",
      icon: "●",
    },
    {
      label: "Category",
      path: "/admin/categories",
      icon: "◈",
    },
    {
      label: "Venue",
      path: "/admin/venues",
      icon: "⌂",
    },
    {
      label: "Ticket Types",
      path: "/admin/ticket-types",
      icon: "▤",
    },
    {
      label: "Payments",
      path: "/admin/payments",
      icon: "Rp",
    },
  ];

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin logout?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/10 bg-[#0d0d0d] lg:flex lg:flex-col">

      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-white/10 px-6">

        <Link to="/admin" className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 font-bold">
            C
          </div>

          <div>
            <p className="font-bold text-white">
              Concertix
            </p>

            <p className="text-xs tracking-wider text-purple-400">
              ADMIN PANEL
            </p>
          </div>

        </Link>

      </div>

      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Management
        </p>

        <nav className="space-y-1">

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >

              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </NavLink>

          ))}

        </nav>

      </div>

      {/* BOTTOM */}

      <div className="border-t border-white/10 p-4">

        <Link
          to="/"
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
            ↗
          </span>

          <span>
            Lihat Website
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;