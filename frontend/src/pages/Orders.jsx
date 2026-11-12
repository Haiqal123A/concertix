import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Search,
  Ticket,
} from "lucide-react";
import api from "../services/api";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("id-ID");

const formatDate = (value) => {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getPaymentLabel = (status) => {
  if (status === "paid") return "Lunas";
  if (status === "pending") return "Menunggu pembayaran";
  if (status === "unpaid") return "Belum dibayar";
  return status || "Belum diketahui";
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    let active = true;

    const getOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/orders");
        if (active) setOrders(response.data.data || []);
      } catch (err) {
        console.error("GET ORDERS ERROR:", err);
        if (active) {
          setError(
            err.response?.data?.message || "Gagal mengambil data pesanan."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    getOrders();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter(
        (order) =>
          order.payment_status === "pending" ||
          order.payment_status === "unpaid"
      ).length,
      paid: orders.filter((order) => order.payment_status === "paid").length,
    }),
    [orders]
  );

  const visibleOrders = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");

    return orders.filter((order) => {
      const isPaid = order.payment_status === "paid";
      const isPending =
        order.payment_status === "pending" ||
        order.payment_status === "unpaid";
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "paid" && isPaid) ||
        (activeFilter === "pending" && isPending);

      const concertTitle =
        order.order_items?.[0]?.ticket_types?.concerts?.title || "";
      const matchesSearch =
        !keyword ||
        String(order.id).includes(keyword) ||
        concertTitle.toLocaleLowerCase("id-ID").includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, search]);

  const filters = [
    { id: "all", label: "Semua pesanan", count: counts.all },
    { id: "pending", label: "Menunggu pembayaran", count: counts.pending },
    { id: "paid", label: "Sudah dibayar", count: counts.paid },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-violet-950/10 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-14 -top-32 -z-10 h-80 w-80 rounded-full bg-violet-600/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-9rem] right-1/3 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Hai{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
                <span className="mt-1 block text-slate-300">
                  Siap menikmati momen berikutnya?
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Pantau pembayaran dan temukan semua tiket konsermu dalam satu
                tempat.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-100"
            >
              Jelajahi konser <Compass size={17} />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Total pesanan</span>
                <Ticket size={17} className="text-violet-300" />
              </div>
              <p className="mt-3 text-3xl font-bold">{counts.all}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Menunggu pembayaran
                </span>
                <Clock3 size={17} className="text-amber-300" />
              </div>
              <p className="mt-3 text-3xl font-bold">{counts.pending}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Sudah dibayar</span>
                <CheckCircle2 size={17} className="text-emerald-300" />
              </div>
              <p className="mt-3 text-3xl font-bold">{counts.paid}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Pesanan saya
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Buka detail pesanan untuk melanjutkan pembayaran atau melihat
                tiket.
              </p>
            </div>

            {orders.length > 0 && (
              <label className="relative block w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari konser atau nomor order"
                  aria-label="Cari konser atau nomor order"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            )}
          </div>

          {orders.length > 0 && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={activeFilter === filter.id}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    activeFilter === filter.id
                      ? "bg-violet-700 text-white shadow-md shadow-violet-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeFilter === filter.id
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
                  <div className="mt-6 h-20 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
            >
              <p className="font-semibold">Pesanan belum dapat dimuat</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Ticket size={25} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-950">
                Perjalanan konsermu dimulai di sini
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Kamu belum punya pesanan. Jelajahi konser yang akan datang dan
                simpan tempatmu.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800"
              >
                Temukan konser <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="mt-5">
              {visibleOrders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  Tidak ada pesanan yang cocok. Coba ubah pencarian atau filter.
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleOrders.map((order) => {
                    const isPaid = order.payment_status === "paid";
                    const isPending =
                      order.payment_status === "pending" ||
                      order.payment_status === "unpaid";
                    const firstItem = order.order_items?.[0];
                    const concert =
                      firstItem?.ticket_types?.concerts;
                    const ticketCount = Number(
                      order.ticket_count ??
                        order.order_items?.reduce(
                          (total, item) =>
                            total + Number(item.quantity || 0),
                          0
                        ) ??
                        0
                    );

                    return (
                      <article
                        key={order.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/60"
                      >
                        <div className="flex gap-4 p-5">
                          {concert?.poster ? (
                            <img
                              src={concert.poster}
                              alt={concert.title || "Poster konser"}
                              className="h-28 w-20 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700">
                              <Ticket size={25} />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Order #{order.id}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isPending
                                      ? "bg-amber-50 text-amber-800"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isPaid ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <Clock3 size={13} />
                                )}
                                {getPaymentLabel(order.payment_status)}
                              </span>
                            </div>

                            <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-950">
                              {concert?.title || "Pesanan tiket konser"}
                            </h3>

                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays size={14} />
                              {concert?.concert_date
                                ? formatDate(
                                    `${concert.concert_date}T00:00:00`
                                  )
                                : `Dipesan ${formatDate(order.created_at)}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {isPaid
                                ? `${ticketCount} tiket`
                                : `Dipesan ${formatDate(order.created_at)}`}
                            </p>
                            <p className="mt-1 font-bold text-slate-950">
                              Rp {formatCurrency(order.total_price)}
                            </p>
                          </div>
                          <Link
                            to={`/orders/${order.id}`}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                              isPaid
                                ? "border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                                : "bg-violet-700 text-white hover:bg-violet-800"
                            }`}
                          >
                            {isPaid ? "Lihat tiket" : "Lihat pembayaran"}
                            <ArrowRight size={15} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Orders;
