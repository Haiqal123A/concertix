import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Ticket,
} from "lucide-react";
import QRCode from "qrcode";
import api from "../services/api";
import "./TicketPrint.css";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("id-ID");

function TicketQr({ value }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    })
      .then((dataUrl) => {
        if (active) setImage(dataUrl);
      })
      .catch((err) => {
        console.error("GENERATE TICKET QR ERROR:", err);
      });

    return () => {
      active = false;
    };
  }, [value]);

  return image ? (
    <img src={image} alt="QR code tiket" className="ticket-qr-image" />
  ) : (
    <span className="text-xs text-slate-400">Menyiapkan QR...</span>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [configError, setConfigError] = useState("");
  const [paying, setPaying] = useState(false);

  const loadOrder = useCallback(async () => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [orderResult, configResult] = await Promise.allSettled([
          api.get(`/orders/${id}`),
          api.get("/payments/config"),
        ]);

        if (!active) return;

        if (orderResult.status === "rejected") {
          throw orderResult.reason;
        }

        setOrder(orderResult.value.data.data);

        if (configResult.status === "fulfilled") {
          setPaymentConfig(configResult.value.data.data);
        } else {
          console.error("GET PAYMENT CONFIG ERROR:", configResult.reason);
          setConfigError("Status pembayaran tidak dapat diperiksa.");
        }
      } catch (err) {
        console.error("GET ORDER DETAIL ERROR:", err);
        if (active) {
          setError(
            err.response?.data?.message || "Gagal mengambil detail order."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (order?.payment_status !== "pending") return undefined;

    let active = true;
    let timeoutId;

    const checkPaymentStatus = async () => {
      try {
        await api.get(`/payments/${id}/status`);
      } catch (err) {
        console.error("POLL ORDER PAYMENT STATUS ERROR:", err);
      }

      try {
        const latestOrder = await loadOrder();
        if (active) setOrder(latestOrder);
      } catch (err) {
        console.error("REFRESH ORDER AFTER PAYMENT CHECK ERROR:", err);
      }

      if (active) {
        timeoutId = window.setTimeout(checkPaymentStatus, 5000);
      }
    };

    checkPaymentStatus();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [id, loadOrder, order?.payment_status]);

  const handleCheckout = async () => {
    try {
      setPaying(true);
      const response = await api.post(`/payments/${id}/checkout`);
      const redirectUrl = response.data.data?.redirect_url;

      if (!redirectUrl) {
        throw new Error("Tautan pembayaran Midtrans tidak tersedia.");
      }

      window.location.assign(redirectUrl);
    } catch (err) {
      console.error("MIDTRANS CHECKOUT ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal membuka pembayaran Midtrans."
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-32">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-10 w-64 rounded-xl bg-slate-200" />
          <div className="h-48 rounded-3xl bg-white" />
          <div className="h-72 rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-32">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Order tidak dapat ditampilkan
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error || "Order yang kamu cari tidak tersedia."}
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Kembali ke order
          </Link>
        </section>
      </main>
    );
  }

  const isPaid = order.payment_status === "paid";
  const isPending = order.payment_status === "pending";
  const orderItems = order.order_items || [];
  const tickets = order.tickets || [];
  const totalItems = Number(
    order.ticket_count ??
      orderItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      )
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50/70 via-slate-50 to-fuchsia-50/60 px-4 pb-20 pt-28 text-slate-900 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[28px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-7">
          <Link
            to="/orders"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700 hover:shadow-md hover:shadow-violet-950/5"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Kembali ke pesanan
          </Link>

          <header className="relative isolate mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-5 py-6 text-white sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute -right-12 -top-28 -z-10 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Order #{order.id}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  Dibuat {new Date(order.created_at).toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800"
                    : isPending
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {isPaid ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                Pembayaran: {order.payment_status}
              </span>
            </div>
          </header>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Ticket size={21} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {isPaid ? "Tiket kamu" : "Tiket akan diterbitkan"}
                </h2>
                <p className="text-sm text-slate-500">
                  {isPaid
                    ? `${totalItems} tiket tersedia untuk order ini`
                    : "Detail tiket muncul otomatis setelah pembayaran berhasil"}
                </p>
              </div>
            </div>

            {isPaid ? (
              <div className="mt-6 space-y-5">
                {tickets.length > 0 ? (
                  <>
                    <div className="ticket-print-controls flex justify-end">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                      >
                        Unduh tiket (PDF)
                      </button>
                    </div>
                    <div className="ticket-print-area space-y-5">
                      {tickets.map((issuedTicket) => {
                        const item = issuedTicket.order_items;
                        const ticketType = item?.ticket_types;
                        const concert = ticketType?.concerts;
                        const venue = concert?.venues;

                        return (
                          <article
                            key={issuedTicket.id}
                            className="issued-ticket overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                          >
                            <div className="flex min-h-32">
                              {concert?.poster && (
                                <img
                                  src={concert.poster}
                                  alt={concert.title || "Konser"}
                                  className="hidden w-28 object-cover sm:block"
                                />
                              )}
                              <div className="min-w-0 flex-1 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                                  Concertix · Tiket masuk
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950">
                                  {concert?.title || "Tiket konser"}
                                </h3>
                                <p className="mt-1 text-sm text-violet-700">
                                  {ticketType?.name || "Tiket"} · Pengunjung{" "}
                                  {issuedTicket.attendee_number}
                                </p>
                                {order.customer_name && (
                                  <p className="mt-2 text-sm text-slate-700">
                                    Nama: {order.customer_name}
                                  </p>
                                )}
                                {order.customer_email && (
                                  <p className="mt-1 text-sm text-slate-600">
                                    Email: {order.customer_email}
                                  </p>
                                )}
                                <p className="mt-3 text-sm text-slate-600">
                                  {concert?.concert_date
                                    ? new Date(
                                        `${concert.concert_date}T00:00:00`
                                      ).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })
                                    : "Tanggal menyusul"}
                                  {concert?.concert_time
                                    ? ` · ${concert.concert_time.slice(0, 5)}`
                                    : ""}
                                </p>
                                {venue?.name && (
                                  <p className="mt-1 text-sm text-slate-600">
                                    {venue.name}
                                    {venue.city ? `, ${venue.city}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-3 border-t border-dashed border-slate-300 bg-slate-50 p-5">
                              <TicketQr value={issuedTicket.ticket_code} />
                              <p className="break-all text-center font-mono text-xs text-slate-500">
                                {issuedTicket.ticket_code}
                              </p>
                              <p
                                className={`text-xs font-bold ${
                                  issuedTicket.checked_in_at
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {issuedTicket.checked_in_at
                                  ? "Sudah digunakan"
                                  : `Order #${order.id} · Tunjukkan QR ini di pintu masuk`}
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
                  >
                    Tiket QR belum tersedia. Pastikan migrasi tiket sudah
                    dijalankan di Supabase, lalu muat ulang halaman.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <Clock3 className="mx-auto text-amber-600" size={24} />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Tiket belum diterbitkan
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Selesaikan pembayaran. Status akan diperbarui otomatis setelah
                  Midtrans mengonfirmasi transaksi.
                </p>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mt-5 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">Jumlah tiket</span>
              <span className="font-semibold text-slate-800">{totalItems}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-xl font-bold text-slate-950">
                Rp {formatCurrency(order.total_price)}
              </span>
            </div>

            {!isPaid && (
              <div className="mt-6">
                {paymentConfig?.isConfigured ? (
                  <>
                    <p className="mb-3 text-xs leading-5 text-slate-500">
                      Pilih metode pembayaran yang tersedia di halaman
                      Midtrans.
                    </p>
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={paying}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
                    >
                      {paying
                        ? "Menyiapkan pembayaran..."
                        : isPending
                          ? "Lanjutkan pembayaran"
                          : "Bayar dengan Midtrans"}
                      {!paying && <ExternalLink size={16} />}
                    </button>
                    {isPending && (
                      <p className="mt-3 text-center text-xs text-slate-500">
                        Menunggu konfirmasi pembayaran...
                      </p>
                    )}
                  </>
                ) : (
                  <div
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
                  >
                    {configError ||
                      "Pembayaran belum tersedia. Silakan coba lagi nanti."}
                  </div>
                )}
              </div>
            )}

            {isPaid && (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                Pembayaran berhasil. Tiket kamu sudah tersedia.
              </div>
            )}

            {paymentConfig?.environment === "sandbox" && (
              <p className="mt-4 text-center text-xs text-slate-400">
              </p>
            )}
          </aside>
        </div>
        </div>
      </div>
    </main>
  );
}
