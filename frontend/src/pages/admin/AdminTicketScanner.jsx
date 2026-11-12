import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, ScanLine, XCircle } from "lucide-react";
import api from "../../services/api";

function AdminTicketScanner() {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const submittingRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

  const startScanner = async () => {
    if (!videoRef.current || scanning) return;

    setError("");
    setResult(null);
    setScanning(true);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
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

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
          Validasi masuk
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Scan tiket konser
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Setiap QR hanya berlaku untuk satu kali masuk. Tiket yang sudah
          dipindai akan otomatis ditolak saat dipindai kembali.
        </p>
      </header>

      <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-video bg-slate-950">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
          {!scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-52 w-52 items-center justify-center rounded-3xl border-2 border-dashed border-white/80 text-white/80">
                <ScanLine size={44} />
              </div>
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-52 w-52 rounded-3xl border-2 border-violet-300 shadow-[0_0_0_999px_rgba(15,23,42,0.25)]" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <p className="text-sm text-slate-500">
            {scanning ? "Arahkan kamera ke QR tiket" : "Kamera siap digunakan"}
          </p>
          {scanning ? (
            <button
              type="button"
              onClick={stopScanner}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Berhenti
            </button>
          ) : (
            <button
              type="button"
              onClick={startScanner}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
            >
              <Camera size={17} />
              Mulai scan
            </button>
          )}
        </div>
      </div>

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
              {ticket && (
                <div className="mt-3 space-y-1 text-sm">
                  <p>{concert?.title || "Konser"}</p>
                  <p>{ticket.order_items?.ticket_types?.name || "Tiket"}</p>
                  <p>Pengunjung #{ticket.attendee_number}</p>
                  <p>Order #{ticket.order_id}</p>
                  {attendee?.customer_name && (
                    <p>Nama: {attendee.customer_name}</p>
                  )}
                  {attendee?.customer_email && (
                    <p>Email: {attendee.customer_email}</p>
                  )}
                  {concert?.venues?.name && (
                    <p>
                      {concert.venues.name}
                      {concert.venues.city ? `, ${concert.venues.city}` : ""}
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
