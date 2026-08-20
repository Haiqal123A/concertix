import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState(null);

  // =====================================================
  // GET PAYMENTS
  // =====================================================

  const getPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments/admin");

      setPayments(response.data.data || []);
    } catch (err) {
      console.error("GET ADMIN PAYMENTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data payment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  // =====================================================
  // VERIFY
  // =====================================================

  const handleVerify = async (paymentId) => {
    const confirmed = window.confirm(
      "Yakin ingin memverifikasi payment ini?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(paymentId);

      const response = await api.patch(
        `/payments/${paymentId}/verify`
      );

      alert(
        response.data.message ||
          "Payment berhasil diverifikasi."
      );

      await getPayments();
    } catch (err) {
      console.error(
        "VERIFY PAYMENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Gagal memverifikasi payment."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async (paymentId) => {
    const confirmed = window.confirm(
      "Yakin ingin menolak payment ini?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(paymentId);

      const response = await api.patch(
        `/payments/${paymentId}/reject`
      );

      alert(
        response.data.message ||
          "Payment berhasil ditolak."
      );

      await getPayments();
    } catch (err) {
      console.error(
        "REJECT PAYMENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Gagal menolak payment."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-neutral-400">
            Memuat data payment...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

          <button
            onClick={getPayments}
            className="mt-5 rounded-xl bg-white px-5 py-3 font-semibold text-neutral-950"
          >
            Coba Lagi
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-16 text-white">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-10">

          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            ADMIN PANEL
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Verifikasi Payment
          </h1>

          <p className="mt-3 text-neutral-400">
            Kelola pembayaran dan verifikasi
            transaksi pengguna.
          </p>

        </div>

        {/* EMPTY */}

        {payments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <p className="text-lg font-semibold">
              Belum ada payment
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Data pembayaran akan muncul di sini.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {payments.map((payment) => {

              const order = payment.orders;

              const isPending =
                payment.status === "pending";

              return (
                <div
                  key={payment.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold">
                          Payment #{payment.id}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            payment.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : payment.status ===
                                "rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {payment.status}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-neutral-500">
                        Order #{payment.order_id}
                      </p>

                    </div>

                    <div className="text-left lg:text-right">

                      <p className="text-sm text-neutral-500">
                        Total Order
                      </p>

                      <p className="mt-1 text-xl font-black text-violet-400">
                        Rp{" "}
                        {Number(
                          order?.total_price || 0
                        ).toLocaleString("id-ID")}
                      </p>

                    </div>

                  </div>

                  {/* INFO */}

                  <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">

                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-600">
                        Customer
                      </p>

                      <p className="mt-1 font-semibold">
                        {order?.users?.name ||
                          `User #${order?.user_id}`}
                      </p>

                      {order?.users?.email && (
                        <p className="text-sm text-neutral-500">
                          {order.users.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-600">
                        Metode
                      </p>

                      <p className="mt-1 font-semibold">
                        {payment.payment_method}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-600">
                        Tanggal Payment
                      </p>

                      <p className="mt-1 font-semibold">
                        {new Date(
                          payment.payment_date
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>

                  </div>

                  {/* PAYMENT PROOF */}

                  {payment.payment_proof && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                      <p className="text-xs uppercase tracking-wider text-neutral-600">
                        Bukti Pembayaran
                      </p>

                      <a
                        href={
                          payment.payment_proof
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-sm text-violet-400 hover:text-violet-300"
                      >
                        {payment.payment_proof}
                      </a>

                    </div>
                  )}

                  {/* ACTION */}

                  {isPending && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

                      <button
                        onClick={() =>
                          handleReject(
                            payment.id
                          )
                        }
                        disabled={
                          processingId ===
                          payment.id
                        }
                        className="rounded-xl border border-red-500/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId ===
                        payment.id
                          ? "Memproses..."
                          : "Tolak Payment"}
                      </button>

                      <button
                        onClick={() =>
                          handleVerify(
                            payment.id
                          )
                        }
                        disabled={
                          processingId ===
                          payment.id
                        }
                        className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId ===
                        payment.id
                          ? "Memproses..."
                          : "Verifikasi Payment"}
                      </button>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPayments;