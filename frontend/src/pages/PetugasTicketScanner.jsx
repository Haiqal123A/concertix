import { useEffect, useState } from "react";
import { ClipboardList, LogOut, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfirmation } from "../components/useConfirmation";
import api from "../services/api";
import AdminTicketScanner from "./admin/AdminTicketScanner";

const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function PetugasTicketScanner() {
  const navigate = useNavigate();
  const confirm = useConfirmation();
  const [user, setUser] = useState(getStoredUser);
  const [profileError, setProfileError] = useState("");
  const taskDescription = String(user?.description || "").trim();

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then((response) => {
        const profile = response.data.data;
        if (!active) return;

        setUser(profile);
        sessionStorage.setItem("user", JSON.stringify(profile));
      })
      .catch((error) => {
        console.error("GET STAFF PROFILE ERROR:", error);
        if (active) {
          setProfileError(
            error.response?.data?.message ||
              "Keterangan tugas dari admin tidak dapat dimuat."
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Keluar dari akun petugas?",
      message: "Kamu akan keluar dari sesi petugas.",
      confirmLabel: "Logout",
    });
    if (!confirmed) return;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Ticket size={19} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-950">
                Scan tiket
              </p>
              <p className="truncate text-xs text-slate-500">
                Petugas · {user?.name || "Akun petugas"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 pt-5 sm:px-6 sm:pt-7">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ClipboardList size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Keterangan tugas
              </h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                {taskDescription || "Belum ada keterangan tugas."}
              </p>
            </div>
          </div>
          {profileError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {profileError}
            </p>
          )}
        </section>
        <AdminTicketScanner />
      </main>
    </div>
  );
}

export default PetugasTicketScanner;
