import { Navigate, useLocation, useNavigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  // ========================================
  // BELUM LOGIN
  // ========================================
  if (!token || !userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // ========================================
  // ROLE CHECK
  // ========================================
  const hasAccess =
    allowedRoles.length === 0 ||
    allowedRoles.includes(user?.role);

  // ========================================
  // ACCESS DENIED
  // ========================================
  if (!hasAccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5">

        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />

          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        {/* GRID */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* CARD */}
        <div className="relative w-full max-w-md">

          <div className="rounded-[32px] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">

            {/* ICON */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl shadow-xl shadow-violet-900/30">
              🔒
            </div>

            {/* LABEL */}
            <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.25em] text-violet-300">
              Access Restricted
            </p>

            {/* TITLE */}
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Akses Ditolak
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Maaf, akun kamu tidak memiliki izin untuk
              mengakses halaman ini.
            </p>

            {/* USER */}
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.name || "User"}
                </p>

                <p className="mt-0.5 text-xs capitalize text-slate-400">
                  Role: {user?.role || "unknown"}
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <button
                onClick={() =>
                  navigate("/", {
                    replace: true,
                  })
                }
                className="rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                ← Back Home
              </button>

              <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Go Back
              </button>

            </div>

            {/* BRAND */}
            <div className="mt-8 border-t border-white/10 pt-6">

              <p className="text-sm font-black tracking-[0.18em] text-white">
                CONCERT
                <span className="text-violet-400">
                  IX
                </span>
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                Your gateway to unforgettable events.
              </p>

            </div>
          </div>

          {/* STATUS */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

            <span className="text-xs text-slate-500">
              Protected Area
            </span>
          </div>

        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;