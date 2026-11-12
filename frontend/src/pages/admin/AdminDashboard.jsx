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
  upcoming: "bg-violet-50 text-violet-700",
  ongoing: "bg-emerald-50 text-emerald-700",
  sold_out: "bg-amber-50 text-amber-700",
  finished: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-700",
};

const formatConcertDate = (date) => {
  if (!date) return "Tanggal belum ditentukan";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Tanggal belum ditentukan";

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
  const dashboardConcerts = concerts
    .filter(
      (concert) =>
        !["sold_out", "finished", "cancelled"].includes(
          concert.status || "upcoming"
        )
    )
    .slice(0, 3);

  const metrics = [
    {
      label: "Total konser",
      value: error ? "—" : totalConcerts.toLocaleString("id-ID"),
      note: "Konser terdaftar",
      icon: Music2,
      iconStyle: "bg-violet-50 text-violet-700",
    },
    {
      label: "Stok tiket",
      value: error ? "—" : totalTickets.toLocaleString("id-ID"),
      note: "Seluruh kategori tiket",
      icon: Ticket,
      iconStyle: "bg-sky-50 text-sky-700",
    },
    {
      label: "Tiket terjual",
      value: error ? "—" : totalSold.toLocaleString("id-ID"),
      note: "Dari seluruh kategori tiket",
      icon: BadgeCheck,
      iconStyle: "bg-emerald-50 text-emerald-700",
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
      label: "Pembayaran berhasil",
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
    <div className="min-h-full bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <header className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.5rem]">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Ringkasan konser, tiket, dan status pembayaran.
            </p>
          </div>
        </header>

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
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {metrics.map(
            ({ label, value, note, icon: Icon, iconStyle }) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>
                    <p className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.8rem]">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-400">
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

        <section className="mt-7" aria-labelledby="concert-list-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="concert-list-title"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                Konser mendatang
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Maksimal tiga konser yang belum selesai dan belum sold out.
              </p>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {dashboardConcerts.length} ditampilkan
            </span>
          </div>

          <div>
            {dashboardConcerts.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
                Belum ada konser mendatang dengan tiket tersedia.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardConcerts.map((concert) => {
                  const status = concert.status || "upcoming";
                  const venueAddress =
                    concert.venue_address ||
                    concert.venues?.address ||
                    concert.venues?.name;

                  return (
                    <article
                      key={concert.id}
                      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[16/9] bg-slate-100">
                        {concert.poster ? (
                          <img
                            src={concert.poster}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Music2 size={32} strokeWidth={1.6} />
                          </div>
                        )}
                        <span
                          className={`absolute right-3 top-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                            concertStatusStyles[status] ||
                            concertStatusStyles.upcoming
                          }`}
                        >
                          {concertStatusLabels[status] || "Akan datang"}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">
                          {concert.title}
                        </h3>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {concert.artist_names ||
                            concert.artists?.name ||
                            "Artis belum diisi"}
                        </p>
                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 size={14} className="shrink-0 text-slate-400" />
                            {formatConcertDate(concert.concert_date)}
                          </p>
                          {venueAddress && (
                            <p className="truncate text-xs text-slate-500">
                              {venueAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
