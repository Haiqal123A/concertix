
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Music2,
  RefreshCw,
  Ticket,
  XCircle,
  CalendarDays,
  MapPin,
  CreditCard,
} from "lucide-react";
import api from "../../services/api";

const concertStatusLabels = {
  upcoming: "Akan datang",
  ongoing: "Berlangsung",
  sold_out: "Tiket habis",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

const concertStatusStyles = {
  upcoming: "bg-sky-50 text-sky-700",
  ongoing: "bg-emerald-50 text-emerald-700",
  sold_out: "bg-amber-50 text-amber-700",
  finished: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-700",
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("id-ID");

const formatConcertDate = (date) => {
  if (!date) return "Tanggal belum ditentukan";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal belum ditentukan";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

function AdminDashboard() {
  const [concerts, setConcerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // AMBIL DATA DASHBOARD

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
  }, [refreshKey]);

  // PERHITUNGAN STATISTIK

  const totalConcerts = concerts.length;

  const totalTickets = tickets.reduce(
    (total, ticket) =>
      total + Number(ticket.stock || 0),
    0
  );

  const totalSold = tickets.reduce(
    (total, ticket) =>
      total + Number(ticket.sold || 0),
    0
  );

  const totalPayments = payments.length;

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const paidPayments = payments.filter(
    (payment) => payment.status === "paid"
  ).length;

  const rejectedPayments = payments.filter(
    (payment) => payment.status === "rejected"
  ).length;

  const dashboardConcerts = concerts
    .filter(
      (concert) =>
        !["sold_out", "finished", "cancelled"].includes(
          concert.status || "upcoming"
        )
    )
    .slice(0, 3);

  // CARD STATISTIK

  const metrics = [
    {
      label: "Total Konser",
      value: totalConcerts,
      note: "Seluruh konser terdaftar",
      icon: Music2,
      iconStyle: "bg-sky-50 text-sky-600",
      barStyle: "bg-sky-500",
      barWidth: "w-2/3",
    },
    {
      label: "Stok Tiket",
      value: totalTickets,
      note: "Seluruh kategori tiket",
      icon: Ticket,
      iconStyle: "bg-blue-50 text-blue-600",
      barStyle: "bg-blue-500",
      barWidth: "w-4/5",
    },
    {
      label: "Tiket Terjual",
      value: totalSold,
      note: "Total tiket yang terjual",
      icon: BadgeCheck,
      iconStyle: "bg-emerald-50 text-emerald-600",
      barStyle: "bg-emerald-500",
      barWidth: "w-3/5",
    },
    {
      label: "Total Pembayaran",
      value: totalPayments,
      note: "Seluruh transaksi tercatat",
      icon: CreditCard,
      iconStyle: "bg-indigo-50 text-indigo-600",
      barStyle: "bg-indigo-500",
      barWidth: "w-3/4",
    },
  ];

  // STATUS PEMBAYARAN

  const paymentStatuses = [
    {
      label: "Menunggu Pembayaran",
      value: pendingPayments,
      note: "Menunggu konfirmasi Midtrans",
      icon: Clock3,
      color: "amber",
    },
    {
      label: "Pembayaran Berhasil",
      value: paidPayments,
      note: "Tiket tersedia untuk pembeli",
      icon: BadgeCheck,
      color: "emerald",
    },
    {
      label: "Pembayaran Gagal",
      value: rejectedPayments,
      note: "Tidak ada tiket diterbitkan",
      icon: XCircle,
      color: "rose",
    },
  ];

  // LOADING

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eaf5ff]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-sky-100 border-t-sky-500" />

          <p className="text-sm font-medium text-slate-500">
            Menyiapkan dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-[#eaf5ff] via-[#f3f9ff] to-[#e4f2ff]">

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-7 flex flex-col justify-between gap-5 rounded-[22px] border border-white/90 bg-white/90 p-6 shadow-[0_4px_20px_rgba(56,130,200,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-7">

          <div>
            <span className="mb-2 inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Admin Overview
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pantau aktivitas konser, tiket, dan pembayaran dalam satu tempat.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((key) => key + 1)
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-white px-5 py-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setRefreshKey((key) => key + 1)
              }
              className="inline-flex items-center gap-2 font-semibold hover:underline"
            >
              <RefreshCw size={15} />
              Coba lagi
            </button>
          </div>
        )}

        {/* STATISTIK */}

        <section
          aria-label="Statistik dashboard"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map(
            ({
              label,
              value,
              note,
              icon: Icon,
              iconStyle,
              barStyle,
              barWidth,
            }) => (
              <article
                key={label}
                className="group rounded-[21px] border border-white bg-white p-5 shadow-[0_4px_18px_rgba(56,130,200,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(56,130,200,0.12)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>

                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                      {error ? "—" : formatNumber(value)}
                    </h2>

                    <p className="mt-2 text-xs text-slate-400">
                      {note}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconStyle} transition duration-300 group-hover:scale-105`}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                </div>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barStyle} ${barWidth}`}
                  />
                </div>
              </article>
            )
          )}
        </section>

        {/* PEMBAYARAN */}

        <section className="mt-10">

          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Aktivitas Pembayaran
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ringkasan status transaksi yang tercatat.
              </p>
            </div>

            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50"
            >
              Lihat semua
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {paymentStatuses.map(
              ({ label, value, note, icon: Icon, color }) => (
                <article
                  key={label}
                  className="group rounded-[20px] border border-white bg-white p-5 shadow-[0_4px_18px_rgba(56,130,200,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(56,130,200,0.09)]"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        color === "amber"
                          ? "bg-amber-50 text-amber-600"
                          : color === "emerald"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <span
                      className={`text-3xl font-bold tracking-tight ${
                        color === "amber"
                          ? "text-amber-600"
                          : color === "emerald"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {error ? "—" : formatNumber(value)}
                    </span>

                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-slate-800">
                      {label}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {note}
                    </p>
                  </div>

                </article>
              )
            )}

          </div>
        </section>

        {/* KONSER MENDATANG */}

        <section
          className="mt-10"
          aria-labelledby="concert-list-title"
        >

          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

            <div>
              <h2
                id="concert-list-title"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                Konser Mendatang
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Maksimal tiga konser yang belum selesai dan belum sold out.
              </p>
            </div>

            <span className="rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-semibold text-sky-700">
              {dashboardConcerts.length} Ditampilkan
            </span>

          </div>

          {dashboardConcerts.length === 0 ? (

            <div className="rounded-[22px] border border-white bg-white px-5 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Music2 size={26} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                Belum Ada Konser
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Belum ada konser mendatang dengan tiket tersedia.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {dashboardConcerts.map((concert) => {
                const status = concert.status || "upcoming";

                const venueAddress =
                  concert.venue_address ||
                  concert.venues?.address ||
                  concert.venues?.name;

                return (
                  <article
                    key={concert.id}
                    className="group min-w-0 overflow-hidden rounded-[22px] border border-white bg-white shadow-[0_4px_18px_rgba(56,130,200,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(56,130,200,0.12)]"
                  >

                    {/* POSTER */}

                    <div className="relative aspect-[16/9] overflow-hidden bg-sky-50">

                      {concert.poster ? (
                        <img
                          src={concert.poster}
                          alt={concert.title || "Poster konser"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sky-300">
                          <Music2 size={38} strokeWidth={1.5} />
                        </div>
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                          concertStatusStyles[status] ||
                          concertStatusStyles.upcoming
                        }`}
                      >
                        {concertStatusLabels[status] || "Akan datang"}
                      </span>

                    </div>

                    {/* DETAIL KONSER */}

                    <div className="p-5">

                      <h3 className="line-clamp-2 min-h-10 text-base font-bold leading-5 text-slate-900 transition group-hover:text-sky-700">
                        {concert.title}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {concert.artist_names ||
                          concert.artists?.name ||
                          "Artis belum diisi"}
                      </p>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">

                        <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-sky-600"
                          />
                          {formatConcertDate(concert.concert_date)}
                        </p>

                        {venueAddress && (
                          <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <MapPin
                              size={15}
                              className="shrink-0 text-sky-600"
                            />

                            <span className="truncate">
                              {venueAddress}
                            </span>
                          </p>
                        )}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;
