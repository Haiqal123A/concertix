import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("transfer_bank");

  const [paymentProof, setPaymentProof] =
    useState("");

  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await api.get(
          `/orders/${id}`
        );

        setOrder(response.data.data);
      } catch (err) {
        console.error(
          "GET ORDER DETAIL ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Gagal mengambil detail order."
        );
      } finally {
        setLoading(false);
      }
    };

    getOrder();
  }, [id]);

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Pilih metode pembayaran.");
      return;
    }

    try {
      setPaying(true);

      const response = await api.post(
        "/payments",
        {
          order_id: Number(id),
          payment_method: paymentMethod,
          payment_proof:
            paymentProof || null,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Payment gagal dibuat."
        );
      }

      alert(
        "Payment berhasil dibuat dan menunggu verifikasi admin."
      );

      // Ambil ulang data order
      const orderResponse = await api.get(
        `/orders/${id}`
      );

      setOrder(orderResponse.data.data);

    } catch (err) {
      console.error(
        "CREATE PAYMENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal membuat payment."
      );
    } finally {
      setPaying(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-neutral-400">
            Memuat detail order...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error || "Order tidak ditemukan."}
          </div>

          <Link
            to="/orders"
            className="mt-6 inline-block text-violet-400 hover:text-violet-300"
          >
            ← Kembali ke Order
          </Link>

        </div>
      </div>
    );
  }

  const isPaid =
    order.payment_status === "paid";

  const isPending =
    order.payment_status === "pending";

  const canPay =
    order.payment_status === "unpaid";

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-16 text-white">

      <div className="mx-auto max-w-5xl">

        {/* BACK */}
        <Link
          to="/orders"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Kembali ke Order
        </Link>

        {/* HEADER */}
        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
              ORDER DETAIL
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Order #{order.id}
            </h1>
          </div>

          <div className="flex gap-3">

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Order: {order.status}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-400"
                  : isPending
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              Payment: {order.payment_status}
            </span>

          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-xl font-bold">
              Detail Tiket
            </h2>

            <div className="mt-6 space-y-4">

              {order.order_items?.map(
                (item) => {

                  const concert =
                    item.ticket_types?.concerts;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >

                      <div className="flex gap-4">

                        {concert?.poster && (
                          <img
                            src={concert.poster}
                            alt={concert.title}
                            className="h-24 w-20 rounded-xl object-cover"
                          />
                        )}

                        <div className="flex-1">

                          <p className="text-sm text-violet-400">
                            {concert?.title}
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {item.ticket_types?.name}
                          </h3>

                          <p className="mt-2 text-sm text-neutral-500">
                            Rp{" "}
                            {Number(
                              item.price
                            ).toLocaleString(
                              "id-ID"
                            )}{" "}
                            × {item.quantity}
                          </p>

                        </div>

                        <div className="text-right">
                          <p className="text-sm text-neutral-500">
                            Subtotal
                          </p>

                          <p className="mt-1 font-bold">
                            Rp{" "}
                            {Number(
                              item.subtotal
                            ).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* TOTAL */}

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">

              <span className="text-neutral-400">
                Total Pembayaran
              </span>

              <span className="text-2xl font-black text-violet-400">
                Rp{" "}
                {Number(
                  order.total_price
                ).toLocaleString("id-ID")}
              </span>

            </div>

          </div>

          {/* =================================================
              PAYMENT
          ================================================= */}

          <div className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-xl font-bold">
              Pembayaran
            </h2>

            {/* SUDAH PAID */}

            {isPaid && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">

                <p className="font-semibold text-emerald-400">
                  ✓ Pembayaran berhasil
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Pembayaran order ini sudah
                  diverifikasi oleh admin.
                </p>

              </div>
            )}

            {/* PENDING */}

            {isPending && (
              <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">

                <p className="font-semibold text-yellow-400">
                  Menunggu Verifikasi
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Bukti pembayaran sudah
                  dikirim. Silakan tunggu admin
                  melakukan verifikasi.
                </p>

              </div>
            )}

            {/* FORM PAYMENT */}

            {canPay && (
              <form
                onSubmit={handlePayment}
                className="mt-6 space-y-5"
              >

                {/* METHOD */}

                <div>
                  <label className="mb-2 block text-sm text-neutral-400">
                    Metode Pembayaran
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-violet-500"
                  >
                    <option value="transfer_bank">
                      Transfer Bank
                    </option>

                    <option value="e_wallet">
                      E-Wallet
                    </option>
                  </select>
                </div>

                {/* PROOF */}

                <div>
                  <label className="mb-2 block text-sm text-neutral-400">
                    Bukti Pembayaran
                  </label>

                  <input
                    type="text"
                    value={paymentProof}
                    onChange={(e) =>
                      setPaymentProof(
                        e.target.value
                      )
                    }
                    placeholder="URL bukti transfer"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-violet-500"
                  />

                  <p className="mt-2 text-xs text-neutral-600">
                    Untuk sementara gunakan URL
                    gambar. Upload file akan kita
                    buat setelah flow ini selesai.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full rounded-xl bg-white py-3.5 font-semibold text-neutral-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying
                    ? "Mengirim..."
                    : "Kirim Pembayaran"}
                </button>

              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetail;