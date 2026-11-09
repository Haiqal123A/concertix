import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await api.get("/orders");

        setOrders(response.data.data || []);
      } catch (err) {
        console.error("GET ORDERS ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data order."
        );
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-neutral-900">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute right-[-160px] top-[15%] h-[420px] w-[420px] rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[35%] h-[380px] w-[380px] rounded-full bg-violet-100/50 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32 lg:px-8">
        {/* BACK */}
        

        {/* HEADER */}
        <div className="mt-8">
         
          <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">
            Pesanan{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
              Saya
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Lihat semua pesanan tiket konser dan lanjutkan
            pembayaran dengan mudah.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-10 space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="h-4 w-24 rounded bg-neutral-200" />

                <div className="mt-4 h-6 w-64 rounded bg-neutral-200" />

                <div className="mt-6 h-4 w-full rounded bg-neutral-100" />

                <div className="mt-3 h-4 w-2/3 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl text-red-500">
              !
            </div>

            <h2 className="mt-4 text-lg font-bold text-neutral-900">
              Gagal mengambil pesanan
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && orders.length === 0 && (
          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
              🎟
            </div>

            <h2 className="mt-5 text-xl font-bold text-neutral-900">
              Belum ada order
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Kamu belum memiliki pesanan tiket. Yuk cari
              konser dan temukan event favoritmu.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              Cari Konser →
            </Link>
          </div>
        )}

        {/* ORDERS */}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-10 space-y-5">
            {orders.map((order) => {
              const isPaid =
                order.payment_status === "paid";

              const isPending =
                order.payment_status === "pending";

              const isUnpaid =
                order.payment_status === "unpaid";

              return (
                <div
                  key={order.id}
                  className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 sm:p-7"
                >
                  {/* TOP */}
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                        Order #{order.id}
                      </p>

                      <h2 className="mt-2 truncate text-xl font-black text-neutral-950 sm:text-2xl">
                        {order.order_items?.[0]?.ticket_types
                          ?.concerts?.title || "Concert"}
                      </h2>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-black text-violet-600">
                        Rp{" "}
                        {Number(
                          order.total_price || 0
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      Order: {order.status}
                    </span>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        isPaid
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : isPending
                          ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                          : "border-red-200 bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-500"
                            : isPending
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />

                      Payment: {order.payment_status}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="mt-6 border-t border-neutral-200 pt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Detail Tiket
                    </p>

                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-sm text-neutral-600">
                            {item.ticket_types?.name ||
                              "Ticket"}{" "}
                            × {item.quantity}
                          </span>

                          <span className="shrink-0 text-sm font-bold text-neutral-800">
                            Rp{" "}
                            {Number(
                              item.subtotal || 0
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                   
                    {/* BUTTON LANJUT PEMBAYARAN */}
                    {!isPaid && (
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 hover:shadow-violet-300"
                      >
                        {isPending
                          ? "Lihat Pembayaran →"
                          : "Lanjut Pembayaran →"}
                      </Link>
                    )}

                    {isPaid && (
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                      >
                        Pembayaran Berhasil ✓
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA */}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-8 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold text-neutral-900">
                  Mau cari konser lainnya?
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Temukan konser favoritmu dan pesan tiket
                  sekarang.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                Jelajahi Konser →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;