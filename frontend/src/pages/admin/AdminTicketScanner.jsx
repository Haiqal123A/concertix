import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Pencil,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useConfirmation } from "../../components/useConfirmation";
import api from "../../services/api";

function AdminTicketScanner({ canManageStaff = false }) {
  const confirm = useConfirmation();
  const videoRef = useRef(null);
  const staffManagementRef = useRef(null);
  const controlsRef = useRef(null);
  const submittingRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [mirrorPreview, setMirrorPreview] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
  });
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(canManageStaff);
  const [deletingStaffId, setDeletingStaffId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  const handleStaffChange = (event) => {
    setStaffForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetStaffForm = () => {
    setStaffForm({ name: "", email: "", password: "", description: "" });
    setEditingStaffId(null);
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    setStaffError("");

    try {
      const response = await api.get("/auth/staff");
      setStaffMembers(response.data.data || []);
    } catch (requestError) {
      console.error("GET TICKET STAFF ERROR:", requestError);
      setStaffError(
        requestError.response?.data?.message ||
          "Gagal memuat daftar petugas."
      );
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffSubmit = async (event) => {
    event.preventDefault();
    setCreatingStaff(true);
    setStaffError("");
    setStaffSuccess("");
    const wasEditing = Boolean(editingStaffId);

    try {
      const payload = {
        name: staffForm.name,
        email: staffForm.email,
        description: staffForm.description,
      };

      const response = editingStaffId
        ? await api.put(`/auth/staff/${editingStaffId}`, {
            ...payload,
            ...(staffForm.password
              ? { password: staffForm.password }
              : {}),
          })
        : await api.post("/auth/staff", staffForm);

      const savedStaff = response.data.data;
      resetStaffForm();
      await loadStaff();
      setStaffSuccess(
        wasEditing
          ? `Akun petugas ${savedStaff.name} berhasil diperbarui.`
          : `Akun petugas ${savedStaff.name} berhasil dibuat. Sampaikan email dan password login secara aman.`
      );
    } catch (requestError) {
      console.error("SAVE TICKET STAFF ERROR:", requestError);
      setStaffError(
        requestError.response?.data?.message ||
          "Gagal menyimpan akun petugas."
      );
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setStaffForm({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      description: staff.description || "",
    });
    setStaffError("");
    setStaffSuccess("");
    staffManagementRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDeleteStaff = async (staff) => {
    const confirmed = await confirm({
      title: "Hapus akun petugas?",
      message: `Akun ${staff.name} tidak bisa lagi masuk untuk scan tiket. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus petugas",
    });
    if (!confirmed) return;

    setDeletingStaffId(staff.id);
    setStaffError("");
    setStaffSuccess("");

    try {
      await api.delete(`/auth/staff/${staff.id}`);
      if (editingStaffId === staff.id) resetStaffForm();
      await loadStaff();
      setStaffSuccess(`Akun petugas ${staff.name} berhasil dihapus.`);
    } catch (requestError) {
      console.error("DELETE TICKET STAFF ERROR:", requestError);
      setStaffError(
        requestError.response?.data?.message ||
          "Gagal menghapus akun petugas."
      );
    } finally {
      setDeletingStaffId(null);
    }
  };

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  };

  useEffect(
    () => () => {
      controlsRef.current?.stop();
    },
    []
  );

  useEffect(() => {
    if (!canManageStaff) return undefined;

    let active = true;

    api
      .get("/auth/staff")
      .then((response) => {
        if (active) setStaffMembers(response.data.data || []);
      })
      .catch((requestError) => {
        if (!active) return;

        console.error("GET TICKET STAFF ERROR:", requestError);
        setStaffError(
          requestError.response?.data?.message ||
            "Gagal memuat daftar petugas."
        );
      })
      .finally(() => {
        if (active) setStaffLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canManageStaff]);

  const startScanner = async () => {
    if (!videoRef.current || scanning) return;

    setError("");
    setResult(null);
    setScanning(true);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        },
        videoRef.current,
        async (decodedResult, _decodeError, controls) => {
          if (!decodedResult || submittingRef.current) return;

          submittingRef.current = true;
          controls?.stop();
          controlsRef.current = null;
          setScanning(false);

          try {
            const response = await api.post("/tickets/scan", {
              ticket_code: decodedResult.getText(),
            });
            setResult({
              state: "accepted",
              message: response.data.message,
              ticket: response.data.data.ticket,
            });
          } catch (requestError) {
            const state =
              requestError.response?.data?.data?.state ||
              (requestError.response?.status === 409
                ? "already_used"
                : requestError.response?.status === 404 ||
                    requestError.response?.status === 400
                  ? "invalid"
                  : "error");
            setResult({
              state,
              message:
                requestError.response?.data?.message ||
                "Tidak dapat menghubungi server validasi tiket.",
            });
          } finally {
            submittingRef.current = false;
          }
        }
      );

      controlsRef.current = controls;
      const videoTrack =
        videoRef.current.srcObject?.getVideoTracks?.()[0];
      setMirrorPreview(
        videoTrack?.getSettings?.().facingMode !== "environment"
      );
    } catch (cameraError) {
      console.error("START TICKET SCANNER ERROR:", cameraError);
      setScanning(false);
      setError(
        "Kamera tidak dapat dibuka. Izinkan akses kamera atau masukkan kode tiket secara manual."
      );
    }
  };

  const ticket = result?.ticket;
  const concert =
    ticket?.order_items?.ticket_types?.concerts;
  const attendee = ticket?.orders;
  const concertOrderNumber = attendee?.concert_order_numbers?.find(
    (item) => Number(item.concert_id) === Number(concert?.id)
  )?.order_number;

  return (
    <section className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
          Scan tiket konser
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Arahkan kamera ke QR tiket. Setiap tiket hanya bisa digunakan satu
          kali.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0 text-emerald-700"
            />
            <p className="text-xs leading-5 text-emerald-900">
              <span className="font-bold">Berhasil dipindai:</span> tiket valid,
              pengunjung boleh masuk.
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-3">
            <XCircle size={17} className="mt-0.5 shrink-0 text-rose-700" />
            <p className="text-xs leading-5 text-rose-900">
              <span className="font-bold">Sudah dipindai:</span> tiket sudah
              digunakan, jangan izinkan masuk kembali.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-5 sm:rounded-3xl">
        <div className="relative aspect-[4/3] bg-slate-950 sm:aspect-video">
          <video
            ref={videoRef}
            className={`h-full w-full object-cover ${
              mirrorPreview ? "-scale-x-100" : ""
            }`}
            muted
            playsInline
          />
          {!scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-dashed border-white/80 text-white/80 sm:h-52 sm:w-52">
                <ScanLine size={44} />
              </div>
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-3xl border-2 border-emerald-300 shadow-[0_0_0_999px_rgba(15,23,42,0.25)] sm:h-52 sm:w-52" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-slate-600">
            {scanning ? "Arahkan kamera ke QR tiket" : "Kamera siap digunakan"}
          </p>
          {scanning ? (
            <button
              type="button"
              onClick={stopScanner}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Berhenti
            </button>
          ) : (
            <button
              type="button"
              onClick={startScanner}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:w-auto"
            >
              <Camera size={17} />
              Mulai scan
            </button>
          )}
        </div>
      </div>

      {canManageStaff && !result && !error && (
        <section
          ref={staffManagementRef}
          className="mt-7 scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Users size={19} />
              </span>
              <div>
                <h2 className="font-bold text-slate-950">
                  Kelola akun petugas
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Petugas hanya bisa memindai tiket. Atur akun dan keterangan
                  tugasnya di sini.
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {staffMembers.length} petugas
            </span>
          </div>

          {staffError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {staffError}
            </p>
          )}

          {staffSuccess && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {staffSuccess}
            </p>
          )}

          <form
            onSubmit={handleStaffSubmit}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="staff-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nama petugas
              </label>
              <input
                id="staff-name"
                type="text"
                name="name"
                value={staffForm.name}
                onChange={handleStaffChange}
                autoComplete="name"
                required
                placeholder="Nama lengkap"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="staff-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email login
              </label>
              <input
                id="staff-email"
                type="email"
                name="email"
                value={staffForm.email}
                onChange={handleStaffChange}
                autoComplete="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {editingStaffId ? "Password baru (opsional)" : "Password awal"}
              </label>
              <input
                id="staff-password"
                type="password"
                name="password"
                value={staffForm.password}
                onChange={handleStaffChange}
                autoComplete="new-password"
                minLength={6}
                required={!editingStaffId}
                placeholder={
                  editingStaffId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="staff-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Keterangan tugas
              </label>
              <textarea
                id="staff-description"
                name="description"
                value={staffForm.description}
                onChange={handleStaffChange}
                rows={3}
                maxLength={500}
                placeholder="Contoh: Petugas pintu utama sesi malam"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {staffForm.description.length}/500
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
              {editingStaffId && (
                <button
                  type="button"
                  onClick={resetStaffForm}
                  disabled={creatingStaff}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={creatingStaff}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {editingStaffId ? <Pencil size={16} /> : <UserPlus size={16} />}
                {creatingStaff
                  ? "Menyimpan..."
                  : editingStaffId
                    ? "Simpan perubahan"
                    : "Tambah petugas"}
              </button>
            </div>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar petugas
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Akun dan keterangan tugas yang terdaftar.
                </p>
              </div>
              <button
                type="button"
                onClick={loadStaff}
                disabled={staffLoading}
                aria-label="Muat ulang daftar petugas"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-violet-700 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={staffLoading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {staffLoading ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Memuat daftar petugas...
              </p>
            ) : staffMembers.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Belum ada akun petugas. Tambahkan akun melalui formulir di atas.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {staffMembers.map((staff) => (
                  <article
                    key={staff.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-violet-700 shadow-sm">
                        {staff.name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-sm font-bold text-slate-900">
                            {staff.name}
                          </h4>
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-violet-700">
                            {staff.role}
                          </span>
                        </div>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {staff.email}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 min-h-10 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                      {staff.description || "Belum ada keterangan tugas."}
                    </p>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditStaff(staff)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(staff)}
                        disabled={deletingStaffId === staff.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {deletingStaffId === staff.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-2xl border p-5 ${
            result.state === "accepted"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : result.state === "already_used" || result.state === "invalid"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.state === "accepted" ? (
              <CheckCircle2 className="mt-0.5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold">{result.message}</p>
              <p className="mt-1 text-sm leading-5">
                {result.state === "accepted"
                  ? "Tiket valid. Silakan persilakan pengunjung masuk."
                  : result.state === "already_used"
                    ? "Tiket ini sudah digunakan. Jangan izinkan masuk kembali."
                    : result.state === "invalid"
                      ? "Jangan izinkan masuk. Pastikan QR dan pembayaran tiket valid."
                      : "Periksa koneksi, lalu coba pindai kembali."}
              </p>
              {ticket && (
                <div className="mt-3 space-y-1 text-sm">
                  <p>{concert?.title || "Konser"}</p>
                  <p>{ticket.order_items?.ticket_types?.name || "Tiket"}</p>
                  <p>Pengunjung #{ticket.attendee_number}</p>
                  <p>
                    No. pemesanan{" "}
                    {concertOrderNumber
                      ? String(concertOrderNumber).padStart(2, "0")
                      : `#${ticket.order_id}`}
                  </p>
                  {attendee?.customer_name && (
                    <p>Nama: {attendee.customer_name}</p>
                  )}
                  {attendee?.customer_email && (
                    <p>Email: {attendee.customer_email}</p>
                  )}
                  {(concert?.venue_address ||
                    concert?.venues?.address ||
                    concert?.venues?.name ||
                    concert?.venues?.city) && (
                    <p>
                      {concert.venue_address ||
                        concert.venues?.address ||
                        concert.venues?.name ||
                        concert.venues?.city}
                    </p>
                  )}
                  {ticket.checked_in_at && (
                    <p>
                      Waktu scan:{" "}
                      {new Date(ticket.checked_in_at).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setError("");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-sm font-semibold"
          >
            <RotateCcw size={15} />
            Scan tiket berikutnya
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminTicketScanner;
