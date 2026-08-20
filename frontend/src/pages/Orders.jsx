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
    <div className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">

        <Link
          to="/"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Kembali ke Home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            MY ORDERS
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Pesanan Saya
          </h1>
        </div>

        {loading && (
          <p className="mt-10 text-neutral-400">
            Memuat order...
          </p>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">
              Belum ada order.
            </p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-neutral-950"
            >
              Cari Konser
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-10 space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm text-neutral-500">
                      ORDER #{order.id}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {order.order_items?.[0]?.ticket_types
                        ?.concerts?.title ||
                        "Concert"}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-neutral-500">
                      Total
                    </p>

                    <p className="text-xl font-bold text-violet-400">
                      Rp{" "}
                      {Number(
                        order.total_price
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Order: {order.status}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Payment: {order.payment_status}
                  </span>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-neutral-400">
                        {item.ticket_types?.name} ×{" "}
                        {item.quantity}
                      </span>

                      <span>
                        Rp{" "}
                        {Number(
                          item.subtotal
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;