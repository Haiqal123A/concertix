import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Music2,
  Plus,
  RefreshCw,
  Ticket,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

function AdminDashboard() {
  const [concerts, setConcerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          concertResponse,
          ticketResponse,
          paymentResponse,
          paymentConfigResponse,
        ] =
          await Promise.all([
            api.get("/concerts"),
            api.get("/ticket-types"),
            api.get("/payments/admin"),
            api.get("/payments/config"),
          ]);

        setConcerts(concertResponse.data.data || []);
        setTickets(ticketResponse.data.data || []);
        setPayments(paymentResponse.data.data || []);
        setPaymentConfig(paymentConfigResponse.data.data);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
        setError(
          err.response?.data?.message || "Gagal mengambil data dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [refreshKey]);

  const totalConcerts = concerts.length;
  const totalTickets = tickets.reduce(
    (total, ticket) => total + Number(ticket.stock || 0),
    0
  );
  const totalSold = tickets.reduce(
    (total, ticket) => total + Number(ticket.sold || 0),
    0
  );
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  ).length;
  const paidPayments = payments.filter(
    (payment) => payment.status === "paid"
  ).length;
  const rejectedPayments = payments.filter(
    (payment) => payment.status === "rejected"
  ).length;
  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce(
      (total, payment) => total + Number(payment.orders?.total_price || 0),
      0
    );

  const formatRupiah = (number) =>
    `Rp ${Number(number).toLocaleString("id-ID")}`;

  const metrics = [
    {
      label: "Total konser",
      value: error ? "—" : totalConcerts.toLocaleString("id-ID"),
      note: "Konser terdaftar",
      icon: Music2,
      iconStyle: "bg-violet-50 text-violet-700",
      valueStyle: "text-slate-950",
    },
    {
      label: "Stok tiket",
      value: error ? "—" : totalTickets.toLocaleString("id-ID"),
      note: "Seluruh kategori tiket",
      icon: Ticket,
      iconStyle: "bg-sky-50 text-sky-700",
      valueStyle: "text-slate-950",
    },
    {
      label: "Tiket dipesan",
      value: error ? "—" : totalSold.toLocaleString("id-ID"),
      note: "Tiket terjual dari transaksi berhasil",
      icon: ArrowUpRight,
      iconStyle: "bg-emerald-50 text-emerald-700",
      valueStyle: "text-slate-950",
    },
    {
      label: "Pendapatan dibayar",
      value: error ? "—" : formatRupiah(totalRevenue),
      note: "Dari pembayaran berhasil",
      icon: CircleDollarSign,
      iconStyle: "bg-white/10 text-violet-200",
      valueStyle: "text-white",
      featured: true,
    },
  ];

  const paymentStatuses = [
    {
      label: "Menunggu pembayaran",
      value: pendingPayments,
      note: "Menunggu konfirmasi Midtrans",
      icon: Clock3,
      style: "border-amber-100 bg-amber-50/70 text-amber-700",
      iconStyle: "bg-white text-amber-600",
    },
    {
      label: "      Pembayaran berhasil",
      value: paidPayments,
      note: "Tiket tersedia untuk pembeli",
      icon: BadgeCheck,
      style: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
      iconStyle: "bg-white text-emerald-600",
    },
    {
      label: "Pembayaran gagal",
      value: rejectedPayments,
      note: "Tidak ada tiket diterbitkan",
      icon: XCircle,
      style: "border-rose-100 bg-rose-50/70 text-rose-700",
      iconStyle: "bg-white text-rose-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="text-sm font-medium text-slate-500">
            Menyiapkan ringkasan dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute -right-36 -top-32 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

      <main className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Ruang kerja Concertix
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.5rem]">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Pantau aktivitas konser, penjualan tiket, dan pembayaran dalam
              satu tempat.
            </p>
          </div>

          <Link
            to="/admin/concerts"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200/70 transition hover:-translate-y-0.5 hover:bg-violet-700 sm:self-auto"
          >
            <Plus size={17} />
            Kelola konser
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex shrink-0 items-center gap-2 self-start font-semibold text-rose-800 hover:underline sm:self-auto"
            >
              <RefreshCw size={15} />
              Coba lagi
            </button>
          </div>
        )}

        <section
          aria-label="Ringkasan performa"
          className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
        >
          {metrics.map(
            ({
              label,
              value,
              note,
              icon: Icon,
              iconStyle,
              valueStyle,
              featured,
            }) => (
              <article
                key={label}
                className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  featured
                    ? "border-violet-900 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 shadow-violet-950/10"
                    : "border-slate-200/80 bg-white shadow-slate-200/40"
                }`}
              >
                {featured && (
                  <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border-[24px] border-white/[0.04]" />
                )}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        featured ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {label}
                    </p>
                    <p
                      className={`mt-4 break-words text-2xl font-bold tracking-tight sm:text-[1.8rem] ${
                        featured ? "text-white" : valueStyle
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                </div>
                <p
                  className={`relative mt-3 text-xs ${
                    featured ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {note}
                </p>
              </article>
            )
          )}
        </section>

        <section className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Aktivitas pembayaran
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ringkasan status transaksi yang tercatat.
              </p>
            </div>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
            >
              Lihat semua <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {paymentStatuses.map(
              ({ label, value, note, icon: Icon, style, iconStyle }) => (
                <article
                  key={label}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 ${style}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconStyle}`}
                    >
                      <Icon size={19} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{note}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {error ? "—" : value.toLocaleString("id-ID")}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <CreditCard size={21} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  Pembayaran Midtrans
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Alur otomatis: pembayaran terkonfirmasi, tiket langsung tersedia.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  Status integrasi
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    paymentConfig?.isConfigured
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {paymentConfig?.isConfigured
                    ? `Aktif · ${paymentConfig.environment}`
                    : "Belum dikonfigurasi"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pembayaran diproses lewat Midtrans. Notifikasi gateway akan
                memperbarui status order dan menerbitkan tiket setelah transaksi
                berhasil.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-slate-500">
                {paymentConfig?.isConfigured
                  ? `Midtrans aktif pada mode ${paymentConfig.environment}.`
                  : "Checkout dinonaktifkan sampai kredensial Midtrans dikonfigurasi di backend."}
              </p>
              <Link
                to="/admin/payments"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
              >
                Lihat transaksi <ArrowUpRight size={15} />
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">Akses cepat</h2>
              <p className="mt-1 text-sm text-slate-500">
                Lanjutkan pekerjaan admin.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                to="/admin/concerts"
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-violet-100 hover:bg-violet-50/60"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                    <Music2 size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Kelola konser
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {error
                        ? "Data belum tersedia"
                        : `${totalConcerts.toLocaleString("id-ID")} konser terdaftar`}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-700"
                />
              </Link>

              <Link
                to="/admin/payments"
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-violet-100 hover:bg-violet-50/60"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <CreditCard size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Transaksi menunggu
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {error
                        ? "Data belum tersedia"
                        : `${pendingPayments.toLocaleString("id-ID")} menunggu verifikasi`}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-700"
                />
              </Link>

              <Link
                to="/"
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-violet-100 hover:bg-violet-50/60"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <ArrowUpRight size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Buka website
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Lihat tampilan untuk pelanggan
                    </span>
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-700"
                />
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
