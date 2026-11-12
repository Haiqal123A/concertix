import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Search,
  Settings2,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import QRCode from "qrcode";
import api from "../../services/api";

function AdminTicketQr({ ticketCode }) {
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(ticketCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    })
      .then((image) => {
        if (active) setQrImage(image);
      })
      .catch((err) => {
        console.error("GENERATE ADMIN TICKET QR ERROR:", err);
      });

    return () => {
      active = false;
    };
  }, [ticketCode]);

  if (!qrImage) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white text-center text-[10px] text-slate-400">
        Menyiapkan QR...
      </div>
    );
  }

  return (
    <img
      src={qrImage}
      alt={`QR tiket ${ticketCode}`}
      className="h-24 w-24 shrink-0 rounded-lg bg-white p-1"
    />
  );
}

const setupSteps = [
  {
    number: "01",
    title: "Simpan kredensial di backend",
    description:
      "Tambahkan Server Key ke environment backend lokal. Jangan letakkan Server Key di frontend atau commit ke Git.",
  },
  {
    number: "02",
    title: "Aktifkan notifikasi Midtrans",
    description:
      "Konfigurasikan URL notifikasi publik agar backend menerima status pembayaran langsung dari Midtrans.",
  },
  {
    number: "03",
    title: "Uji alur Sandbox",
    description:
      "Uji pembayaran sukses, tertunda, kedaluwarsa, dan gagal sebelum beralih ke kredensial Production.",
  },
];

function AdminPayments() {
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [configError, setConfigError] = useState("");
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/payments/config")
      .then((response) => setPaymentConfig(response.data.data))
      .catch((err) => {
        console.error("GET PAYMENT CONFIG ERROR:", err);
        setConfigError(
          err.response?.data?.message ||
            "Status konfigurasi Midtrans tidak dapat dimuat."
        );
      });
  }, []);

  useEffect(() => {
    api
      .get("/payments/admin")
      .then((response) => setPayments(response.data.data || []))
      .catch((err) => {
        console.error("GET ADMIN PAYMENTS ERROR:", err);
        setPaymentsError(
          err.response?.data?.message ||
            "Data pembayaran dan tiket tidak dapat dimuat."
        );
      })
      .finally(() => setPaymentsLoading(false));
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const order = payment.orders;
    const query = search.trim().toLocaleLowerCase("id-ID");
    if (!query) return true;

    return [
      order?.customer_name,
      order?.customer_email,
      String(order?.id || payment.order_id || ""),
    ].some((value) =>
      String(value || "").toLocaleLowerCase("id-ID").includes(query)
    );
  });

  const isConfigured = paymentConfig?.isConfigured === true;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto max-w-[1440px]">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Pengaturan transaksi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Pembayaran
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Siapkan checkout Midtrans. Setelah pembayaran dikonfirmasi melalui
            notifikasi tepercaya, status order diperbarui dan tiket tersedia
            otomatis untuk pelanggan.
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-6 py-7 text-white sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[38px] border-white/[0.05]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200 ring-1 ring-white/10">
                  <CreditCard size={23} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                      Midtrans
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        isConfigured
                          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                          : "border-amber-300/20 bg-amber-300/10 text-amber-200"
                      }`}
                    >
                      {isConfigured
                        ? `Aktif · ${paymentConfig.environment}`
                        : "Belum dikonfigurasi"}
                    </span>
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    {isConfigured
                      ? `Gateway siap menerima pembayaran pada mode ${paymentConfig.environment}. Pastikan notifikasi Midtrans diarahkan ke endpoint backend.`
                      : configError ||
                        "Gateway belum aktif karena kredensial belum dimasukkan. Checkout tetap dinonaktifkan sampai konfigurasi siap."}
                  </p>
                </div>
              </div>

              <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-300">
                <Clock3 size={15} />
                {isConfigured
                  ? `Mode ${paymentConfig.environment}`
                  : "Gateway belum aktif"}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              URL notifikasi Midtrans
            </p>
            <code className="mt-2 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
              https://&lt;domain-backend&gt;/api/payments/midtrans/notification
            </code>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
            {setupSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
              >
                <span className="text-xs font-bold tracking-[0.14em] text-violet-600">
                  LANGKAH {step.number}
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={19} />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Alur setelah gateway aktif
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Browser tidak menentukan status pembayaran. Backend akan
                  memvalidasi notifikasi Midtrans, memperbarui order hanya saat
                  transaksi berhasil, lalu membuka tiket pelanggan.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                { label: "Checkout", icon: CreditCard },
                { label: "Status terkonfirmasi", icon: CheckCircle2 },
                { label: "Tiket tersedia", icon: Ticket },
              ].map(({ label, icon: Icon }, index) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm">
                    <Icon size={16} />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {label}
                  </span>
                  {index < 2 && (
                    <span className="ml-auto hidden text-slate-300 sm:block">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <Settings2 size={19} />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Kredensial tetap rahasia
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Jangan kirim atau menaruh Server Key di chat, source frontend,
                  atau repository. Simpan di file environment backend lokal
                  yang masuk `.gitignore`. Setelah key tersedia, integrasi dapat
                  dipasang dan dites di Sandbox.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                Data pelanggan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Pembayaran & tiket
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cari berdasarkan nama atau email yang diisi saat pemesanan.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau email..."
                aria-label="Cari pembayaran berdasarkan nama atau email"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>

          {paymentsError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {paymentsError}
            </p>
          )}

          {paymentsLoading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Memuat data pembayaran dan tiket...
            </div>
          ) : !paymentsError && filteredPayments.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {payments.length === 0
                ? "Belum ada data pembayaran."
                : "Tidak ada pemesan yang cocok dengan pencarian."}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredPayments.map((payment) => {
                const order = payment.orders;
                const tickets = order?.tickets || [];

                return (
                  <article
                    key={payment.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-950">
                            {order?.customer_name || "Nama belum diisi"}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              payment.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : payment.status === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {order?.customer_email || "Email belum diisi"}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Order #{payment.order_id} ·{" "}
                          {new Date(payment.payment_date).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Total
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                          Rp{" "}
                          {Number(order?.total_price || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Ticket size={16} className="text-violet-600" />
                        Tiket{" "}
                        {payment.status === "paid"
                          ? `(${tickets.length})`
                          : "(terbit setelah pembayaran berhasil)"}
                      </p>
                      {tickets.length > 0 ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {tickets.map((ticket) => {
                            const item = Array.isArray(ticket.order_items)
                              ? ticket.order_items[0]
                              : ticket.order_items;
                            const ticketType = Array.isArray(item?.ticket_types)
                              ? item.ticket_types[0]
                              : item?.ticket_types;
                            const concert = Array.isArray(
                              ticketType?.concerts
                            )
                              ? ticketType.concerts[0]
                              : ticketType?.concerts;

                            return (
                              <div
                                key={ticket.id}
                                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {ticket.ticket_code && (
                                    <AdminTicketQr
                                      ticketCode={ticket.ticket_code}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      {concert?.title || "Tiket konser"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {ticketType?.name || "Tiket"} · Pengunjung{" "}
                                      {ticket.attendee_number}
                                    </p>
                                    <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                                      {ticket.ticket_code}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    ticket.checked_in_at
                                      ? "bg-slate-200 text-slate-600"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {ticket.checked_in_at
                                    ? "Sudah masuk"
                                    : "Belum dipakai"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          {payment.status === "paid"
                            ? "Belum ada tiket untuk pembayaran ini."
                            : "Tiket akan muncul setelah pembayaran dikonfirmasi."}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleDollarSign
              size={19}
              className="mt-0.5 shrink-0 text-violet-700"
            />
            <p className="text-sm leading-6 text-slate-700">
              Pembayaran QRIS statis dan unggah bukti manual tidak dipakai
              untuk checkout otomatis Midtrans.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            Kembali ke dashboard <ArrowUpRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminPayments;
