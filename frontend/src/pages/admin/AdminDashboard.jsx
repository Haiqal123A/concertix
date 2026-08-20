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

        const [concertResponse, ticketResponse, paymentResponse] =
          await Promise.all([
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
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Memuat dashboard admin...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm tracking-[0.3em] text-purple-400 mb-3">
            ADMIN PANEL
          </p>

          <h1 className="text-4xl font-bold">
            Dashboard Admin
          </h1>

          <p className="text-zinc-400 mt-2">
            Kelola konser, tiket, order, dan pembayaran Concertix.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {/* CONCERT */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-zinc-500">
              Total Konser
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {totalConcerts}
            </h2>

            <p className="text-sm text-purple-400 mt-2">
              Konser tersedia
            </p>
          </div>

          {/* TICKET */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-zinc-500">
              Total Tiket
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {totalTickets.toLocaleString("id-ID")}
            </h2>

            <p className="text-sm text-purple-400 mt-2">
              Stok keseluruhan
            </p>
          </div>

          {/* SOLD */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-zinc-500">
              Tiket Terjual
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {totalSold.toLocaleString("id-ID")}
            </h2>

            <p className="text-sm text-green-400 mt-2">
              Tiket berhasil terjual
            </p>
          </div>

          {/* REVENUE */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#111111] p-6">
            <p className="text-sm text-zinc-500">
              Total Pendapatan
            </p>

            <h2 className="text-2xl font-bold mt-3 text-purple-400">
              {formatRupiah(totalRevenue)}
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              Dari payment terverifikasi
            </p>
          </div>

        </div>

        {/* PAYMENT STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="rounded-2xl border border-yellow-500/20 bg-[#111111] p-6">
            <p className="text-zinc-500 text-sm">
              Menunggu Verifikasi
            </p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-400">
              {pendingPayments}
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              Payment pending
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#111111] p-6">
            <p className="text-zinc-500 text-sm">
              Payment Berhasil
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-400">
              {paidPayments}
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              Sudah diverifikasi
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[#111111] p-6">
            <p className="text-zinc-500 text-sm">
              Payment Ditolak
            </p>

            <h2 className="text-3xl font-bold mt-2 text-red-400">
              {rejectedPayments}
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              Payment rejected
            </p>
          </div>

        </div>

        {/* QUICK ACTION */}
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">

          <h2 className="text-xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link
              to="/admin/payments"
              className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <p className="font-semibold">
                Verifikasi Payment
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                Kelola pembayaran pengguna
              </p>
            </Link>

            <Link
              to="/"
              className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <p className="font-semibold">
                Lihat Website
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                Kembali ke halaman utama
              </p>
            </Link>

            <Link
              to="/admin/payments"
              className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 hover:bg-purple-500/10 transition"
            >
              <p className="font-semibold text-purple-400">
                Payment Masuk
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                {pendingPayments} payment menunggu
              </p>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;