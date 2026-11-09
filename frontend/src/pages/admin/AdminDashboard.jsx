import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminDashboard() {
  const [concerts, setConcerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          concertResponse,
          ticketResponse,
          paymentResponse,
        ] = await Promise.all([
          api.get("/concerts"),
          api.get("/ticket-types"),
          api.get("/payments/admin"),
        ]);

        setConcerts(concertResponse.data.data || []);
        setTickets(ticketResponse.data.data || []);
        setPayments(paymentResponse.data.data || []);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

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
      (total, payment) =>
        total + Number(payment.orders?.total_price || 0),
      0
    );

  const formatRupiah = (number) => {
    return `Rp ${Number(number).toLocaleString("id-ID")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="text-sm font-medium text-neutral-500">
            Memuat dashboard admin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">

      {/* =========================
          BACKGROUND GLOW
      ========================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-100/60 blur-3xl" />

        <div className="absolute right-[-120px] top-20 h-96 w-96 rounded-full bg-fuchsia-100/50 blur-3xl" />

        <div className="absolute left-1/2 top-[650px] h-80 w-80 -translate-x-1/2 rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5">

            </div>

            <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
              Dashboard Admin
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Kelola konser, tiket, order, dan pembayaran Concertix
              dengan mudah.
            </p>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL CONCERT */}

          <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Total Konser
                </p>

                <h2 className="mt-3 text-3xl font-black text-neutral-950">
                  {totalConcerts}
                </h2>
              </div>

             
            </div>

<p className="mt-3 text-xs font-semibold text-gray-400/50">              Konser tersedia
            </p>
          </div>

          {/* TOTAL TICKET */}

          <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Total Tiket
                </p>

                <h2 className="mt-3 text-3xl font-black text-neutral-950">
                  {totalTickets.toLocaleString("id-ID")}
                </h2>
              </div>
            </div>

<p className="mt-3 text-xs font-semibold text-gray-400/50">
              Stok keseluruhan
            </p>
          </div>

          {/* SOLD */}

          <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Tiket Terjual
                </p>

                <h2 className="mt-3 text-3xl font-black text-neutral-950">
                  {totalSold.toLocaleString("id-ID")}
                </h2>
              </div>
            </div>

<p className="mt-3 text-xs font-semibold text-gray-400/50">
              Tiket berhasil terjual
            </p>
          </div>

          {/* REVENUE */}

          <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Total Pendapatan
                </p>

                <h2 className="mt-3 text-3xl font-black text-neutral-950">
                  {formatRupiah(totalRevenue)}
                </h2>
              </div>
            </div>

<p className="mt-3 text-xs font-semibold text-gray-400/50">
              Dari payment terverifikasi
            </p>
          </div>
        </div>

        {/* =========================
            PAYMENT STATUS
        ========================= */}

        <div className="mb-8">

          <div className="mb-4">
            <h2 className="text-xl font-black text-neutral-950">
              Status Pembayaran
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Ringkasan pembayaran pengguna.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* PENDING */}

<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
  <div className="flex items-center justify-between">
    <p className="text-sm font-semibold text-neutral-600">
      Menunggu Verifikasi
    </p>
  </div>

  <h2 className="mt-4 text-3xl font-semibold text-neutral-700">
    {pendingPayments}
  </h2>

  <p className="mt-1 text-xs text-neutral-500">
    Payment pending
  </p>
</div>

            {/* PAID */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-600">
                  Payment Berhasil
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-green-700">
                {paidPayments}
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Sudah diverifikasi
              </p>
            </div>

            {/* REJECTED */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-neutral-200/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-600">
                  Payment Ditolak
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-red-700">
                {rejectedPayments}
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Payment rejected
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-200/50 sm:p-6">

          <div className="mb-5">
            <h2 className="text-xl font-black text-neutral-950">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Akses cepat ke fitur penting Concertix.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* PAYMENT */}

            <Link
              to="/admin/payments"
              className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 transition hover:border-violet-200 hover:bg-violet-50/60"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">
                  Verifikasi Payment
                </span>

                <span className="text-neutral-300 transition group-hover:text-violet-600">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-500">
                Kelola pembayaran pengguna.
              </p>
            </Link>

            {/* WEBSITE */}

            <Link
              to="/"
              className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 transition hover:border-violet-200 hover:bg-violet-50/60"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">
                  Lihat Website
                </span>

                <span className="text-neutral-300 transition group-hover:text-violet-600">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-500">
                Kembali ke halaman utama.
              </p>
            </Link>

            {/* PAYMENT MASUK */}

            <Link
              to="/admin/payments"
              className="group rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 transition hover:border-violet-300 hover:shadow-md hover:shadow-violet-100"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-700">
                  Payment Masuk
                </span>

                <span className="text-violet-300 transition group-hover:text-violet-600">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-500">
                {pendingPayments} payment menunggu.
              </p>
            </Link>
          </div>
        </div>

        {/* =========================
            FOOTER INFO
        ========================= */}

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-800">
              Concertix Admin
            </p>

            <p className="text-xs text-neutral-500">
              Kelola seluruh sistem Concertix dari satu tempat.
            </p>
          </div>

          <span className="text-xs font-semibold text-violet-600">
            {totalConcerts} Concert
            {totalConcerts !== 1 ? "s" : ""}
          </span>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;