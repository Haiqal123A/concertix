import {
  ArrowLeft,
  House,
  ShieldAlert,
} from "lucide-react";
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
  } catch {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
        <div className="w-full max-w-md">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShieldAlert size={30} strokeWidth={1.7} />
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Area terbatas
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Akses Ditolak
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Akun kamu tidak memiliki izin untuk mengakses halaman ini.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="mt-0.5 text-xs capitalize text-slate-500">
                  Role: {user?.role || "unknown"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <House size={16} />
                Ke Beranda
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <p className="text-sm font-extrabold tracking-[0.16em] text-slate-900">
                CONCERTIX
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Pengalaman konser yang tak terlupakan
              </p>
            </div>
          </section>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Halaman terproteksi
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;