import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("qris");

  const [selectedBank, setSelectedBank] = useState("bca");
  const [selectedEwallet, setSelectedEwallet] =
    useState("dana");

  const [paymentProof, setPaymentProof] = useState("");
  const [paying, setPaying] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);
  
  // Polling untuk check status pembayaran
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  

  /*
  ============================================================
  DATA PEMBAYARAN
  ============================================================

  GANTI nomor dan nama di bawah dengan rekening/e-wallet kamu.
  Jangan gunakan data contoh ini untuk pembayaran sungguhan.
  */

  const bankAccounts = [
    {
      id: "bca",
      name: "BCA",
      number: "1234567890",
      owner: "Concertix",
      icon: "BCA",
    },
    {
      id: "mandiri",
      name: "Bank Mandiri",
      number: "1234567890",
      owner: "Concertix",
      icon: "M",
    },
    {
      id: "bri",
      name: "BRI",
      number: "1234567890",
      owner: "Concertix",
      icon: "BRI",
    },
  ];

  const ewalletAccounts = [
    {
      id: "dana",
      name: "DANA",
      number: "081234567890",
      owner: "Concertix",
      icon: "D",
    },
    {
      id: "gopay",
      name: "GoPay",
      number: "081234567890",
      owner: "Concertix",
      icon: "G",
    },
    {
      id: "ovo",
      name: "OVO",
      number: "081234567890",
      owner: "Concertix",
      icon: "O",
    },
  ];

  useEffect(() => {
    const getOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data.data);
      } catch (err) {
        console.error("GET ORDER DETAIL ERROR:", err);

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

  // Auto-start polling jika sudah pending
  useEffect(() => {
    if (order && order.payment_status === "pending") {
      startPaymentPolling();
    }
  }, [order?.payment_status]);

  // =====================================================
  // SHOW TOAST NOTIFICATION
  // =====================================================

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // =====================================================
  // POLLING STATUS PEMBAYARAN
  // =====================================================

  const startPaymentPolling = () => {
    if (pollingIntervalRef.current) return;

    setIsPolling(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const updatedOrder = response.data.data;

        setOrder(updatedOrder);

        // Cek apakah pembayaran sudah berhasil
        if (updatedOrder.payment_status === "paid") {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          setIsPolling(false);

          // Show success notification
          showToast(
            "✓ Pembayaran berhasil! Tiket kamu diproses...",
            "success",
            2000
          );

          // Redirect ke halaman orders setelah 2 detik
          setTimeout(() => {
            navigate("/orders", { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error("POLLING ERROR:", err);
      }
    }, 3000); // Polling setiap 3 detik
  };

  const stopPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsPolling(false);
  };

  // Stop polling saat unmount
  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      showToast("Pilih metode pembayaran!", "error");
      return;
    }

    try {
      setPaying(true);

      const response = await api.post("/payments", {
        order_id: Number(id),
        payment_method: paymentMethod,
        payment_proof: paymentProof || null,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Payment gagal dibuat."
        );
      }

      showToast(
        "✓ Pembayaran terkirim! Sedang memverifikasi...",
        "success",
        2000
      );

      const orderResponse = await api.get(
        `/orders/${id}`
      );

      setOrder(orderResponse.data.data);

      // Mulai polling untuk check status pembayaran
      if (orderResponse.data.data.payment_status !== "paid") {
        startPaymentPolling();
      } else {
        // Jika langsung paid, redirect
        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error("CREATE PAYMENT ERROR:", err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          "Gagal membuat payment.",
        "error"
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-200/40 blur-3xl" />

          <div className="absolute right-[-150px] top-[15%] h-[380px] w-[380px] rounded-full bg-fuchsia-200/30 blur-3xl" />
        </div>

        <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-28 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-neutral-200" />

            <div className="mt-5 h-12 w-72 rounded bg-neutral-200" />

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="h-96 rounded-3xl bg-neutral-100" />
              <div className="h-96 rounded-3xl bg-neutral-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white px-6 pb-20 pt-28">
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />

          <div className="relative rounded-3xl border border-red-200 bg-red-50 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-500">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-neutral-900">
              Order tidak ditemukan
            </h1>

            <p className="mt-2 text-neutral-500">
              {error ||
                "Order yang kamu cari tidak tersedia."}
            </p>

            <Link
              to="/orders"
              className="mt-6 inline-flex items-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              ← Kembali ke Order
            </Link>
          </div>
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

  const orderItems = order.order_items || [];

  const totalItems = orderItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const formattedTotal = Number(
    order.total_price || 0
  ).toLocaleString("id-ID");

  const selectedBankData = bankAccounts.find(
    (bank) => bank.id === selectedBank
  );

  const selectedEwalletData = ewalletAccounts.find(
    (wallet) => wallet.id === selectedEwallet
  );

  return (
    <div className="min-h-screen overflow-hidden bg-white text-neutral-900">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute right-[-180px] top-[18%] h-[450px] w-[450px] rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-violet-100/50 blur-3xl" />
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed left-4 right-4 top-6 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 shadow-lg transition-all ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : toast.type === "error"
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-violet-200 bg-violet-50 text-violet-800"
          }`}
        >
          <span className="text-lg">
            {toast.type === "success"
              ? "✓"
              : toast.type === "error"
              ? "✕"
              : "ℹ"}
          </span>
          <span className="text-sm font-medium">
            {toast.message}
          </span>
        </div>
      )}

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pt-32 lg:px-8">
        {/* BACK */}
        <Link
          to="/orders"
          className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-violet-600"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Kembali ke Order
        </Link>

        {/* HEADER */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Order Detail
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">
              Order{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                #{order.id}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
              Berikut detail tiket dan status pembayaran
              untuk pesanan kamu.
            </p>
          </div>

          {/* STATUS */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Order: {order.status}
            </span>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${
                isPaid
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : isPending
                  ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
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
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* ORDER ITEMS */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Tickets
                </p>

                <h2 className="mt-1 text-2xl font-black text-neutral-950">
                  Detail Tiket
                </h2>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-right">
                <p className="text-xs text-neutral-400">
                  Total
                </p>

                <p className="text-sm font-bold text-neutral-800">
                  {totalItems} Tiket
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              {orderItems.length > 0 ? (
                orderItems.map((item) => {
                  const concert =
                    item.ticket_types?.concerts;

                  const itemPrice = Number(
                    item.price || 0
                  ).toLocaleString("id-ID");

                  const itemSubtotal = Number(
                    item.subtotal || 0
                  ).toLocaleString("id-ID");

                  return (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 transition hover:border-violet-200 hover:bg-violet-50/30 sm:p-5"
                    >
                      <div className="flex gap-4">
                        {/* POSTER */}
                        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:h-32 sm:w-24">
                          {concert?.poster ? (
                            <img
                              src={concert.poster}
                              alt={
                                concert.title ||
                                "Concert"
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-400">
                              ♫
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-violet-600">
                            {concert?.title ||
                              "Concert"}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-neutral-900">
                            {item.ticket_types?.name ||
                              "Ticket"}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500">
                            <span>
                              Rp {itemPrice}
                            </span>

                            <span>
                              × {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* SUBTOTAL */}
                        <div className="hidden text-right sm:block">
                          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            Subtotal
                          </p>

                          <p className="mt-2 text-base font-black text-neutral-900">
                            Rp {itemSubtotal}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE SUBTOTAL */}
                      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 sm:hidden">
                        <span className="text-xs uppercase tracking-wider text-neutral-400">
                          Subtotal
                        </span>

                        <span className="font-bold text-neutral-900">
                          Rp {itemSubtotal}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-400">
                  Tidak ada tiket pada order ini.
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="mt-7 border-t border-neutral-200 pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">
                    Total Pembayaran
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Sudah termasuk seluruh tiket
                  </p>
                </div>

                <p className="text-right text-2xl font-black text-violet-600 sm:text-3xl">
                  Rp {formattedTotal}
                </p>
              </div>
            </div>
          </section>

          {/* PAYMENT */}
          <aside className="h-fit">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              {/* PAYMENT HEADER */}
              <div className="border-b border-neutral-200 p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Checkout
                </p>

                <h2 className="mt-1 text-2xl font-black text-neutral-950">
                  Pembayaran
                </h2>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
                  <p className="text-xs text-neutral-500">
                    Total yang harus dibayar
                  </p>

                  <p className="mt-1 text-2xl font-black text-neutral-950">
                    Rp {formattedTotal}
                  </p>
                </div>
              </div>

              {/* PAYMENT BODY */}
              <div className="p-6 sm:p-7">
                {/* PAID */}
                {isPaid && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                      ✓
                    </div>

                    <h3 className="mt-4 font-bold text-emerald-700">
                      Pembayaran Berhasil
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Pembayaran order ini sudah diverifikasi
                      oleh admin. Tiket kamu sudah berhasil
                      diproses.
                    </p>
                  </div>
                )}

                {/* PENDING */}
                {isPending && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100 text-xl text-yellow-600">
                      {isPolling ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        "!"
                      )}
                    </div>

                    <h3 className="mt-4 font-bold text-yellow-700">
                      {isPolling
                        ? "Memverifikasi Pembayaran..."
                        : "Menunggu Verifikasi"}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      {isPolling
                        ? "Sistem sedang memeriksa status pembayaran kamu. Halaman akan otomatis refresh jika pembayaran berhasil diverifikasi."
                        : "Bukti pembayaran sudah dikirim. Silakan tunggu admin melakukan verifikasi."}
                    </p>
                  </div>
                )}

                {/* UNPAID */}
                {canPay && (
                  <form
                    onSubmit={handlePayment}
                    className="space-y-6"
                  >
                    {/* PAYMENT METHOD */}
                    <div>
                      <label className="mb-3 block text-sm font-bold text-neutral-800">
                        Pilih Metode Pembayaran
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        {/* BANK */}
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentMethod(
                              "transfer_bank"
                            )
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            paymentMethod ===
                            "transfer_bank"
                              ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                              : "border-neutral-200 bg-white text-neutral-500 hover:border-violet-200 hover:bg-violet-50"
                          }`}
                        >
                          <div className="text-lg">
                            🏦
                          </div>

                          <div className="mt-1">
                            Bank
                          </div>
                        </button>

                        {/* EWALLET */}
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentMethod(
                              "e_wallet"
                            )
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            paymentMethod === "e_wallet"
                              ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                              : "border-neutral-200 bg-white text-neutral-500 hover:border-violet-200 hover:bg-violet-50"
                          }`}
                        >
                          <div className="text-lg">
                            📱
                          </div>

                          <div className="mt-1">
                            E-Wallet
                          </div>
                        </button>

                        {/* QRIS */}
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentMethod("qris")
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            paymentMethod === "qris"
                              ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                              : "border-neutral-200 bg-white text-neutral-500 hover:border-violet-200 hover:bg-violet-50"
                          }`}
                        >
                          <div className="text-lg">
                            ▦
                          </div>

                          <div className="mt-1">
                            QRIS
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* BANK OPTIONS */}
                    {paymentMethod ===
                      "transfer_bank" && (
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Pilih Bank
                        </p>

                        <div className="space-y-3">
                          {bankAccounts.map((bank) => (
                            <button
                              type="button"
                              key={bank.id}
                              onClick={() =>
                                setSelectedBank(bank.id)
                              }
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                selectedBank === bank.id
                                  ? "border-violet-500 bg-violet-50 shadow-sm"
                                  : "border-neutral-200 bg-white hover:border-violet-200 hover:bg-neutral-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                                    selectedBank ===
                                    bank.id
                                      ? "bg-violet-600 text-white"
                                      : "bg-neutral-100 text-neutral-600"
                                  }`}
                                >
                                  {bank.icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="font-bold text-neutral-900">
                                      {bank.name}
                                    </p>

                                    {selectedBank ===
                                      bank.id && (
                                      <span className="text-violet-600">
                                        ✓
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 text-sm font-semibold tracking-wide text-neutral-700">
                                    {bank.number}
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-400">
                                    a.n. {bank.owner}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {selectedBankData && (
                          <div className="mt-3 rounded-2xl bg-neutral-50 p-4">
                            <p className="text-xs text-neutral-400">
                              Transfer ke rekening
                            </p>

                            <p className="mt-1 font-bold text-neutral-900">
                              {selectedBankData.name}
                            </p>

                            <p className="mt-1 text-lg font-black tracking-wider text-violet-600">
                              {selectedBankData.number}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Atas nama{" "}
                              {selectedBankData.owner}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* EWALLET OPTIONS */}
                    {paymentMethod === "e_wallet" && (
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Pilih E-Wallet
                        </p>

                        <div className="space-y-3">
                          {ewalletAccounts.map(
                            (wallet) => (
                              <button
                                type="button"
                                key={wallet.id}
                                onClick={() =>
                                  setSelectedEwallet(
                                    wallet.id
                                  )
                                }
                                className={`w-full rounded-2xl border p-4 text-left transition ${
                                  selectedEwallet ===
                                  wallet.id
                                    ? "border-violet-500 bg-violet-50 shadow-sm"
                                    : "border-neutral-200 bg-white hover:border-violet-200 hover:bg-neutral-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                                      selectedEwallet ===
                                      wallet.id
                                        ? "bg-violet-600 text-white"
                                        : "bg-neutral-100 text-neutral-600"
                                    }`}
                                  >
                                    {wallet.icon}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-bold text-neutral-900">
                                        {wallet.name}
                                      </p>

                                      {selectedEwallet ===
                                        wallet.id && (
                                        <span className="text-violet-600">
                                          ✓
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-1 text-sm font-semibold tracking-wide text-neutral-700">
                                      {wallet.number}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-400">
                                      a.n. {wallet.owner}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          )}
                        </div>

                        {selectedEwalletData && (
                          <div className="mt-3 rounded-2xl bg-neutral-50 p-4">
                            <p className="text-xs text-neutral-400">
                              Kirim pembayaran ke
                            </p>

                            <p className="mt-1 font-bold text-neutral-900">
                              {selectedEwalletData.name}
                            </p>

                            <p className="mt-1 text-lg font-black tracking-wider text-violet-600">
                              {selectedEwalletData.number}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Atas nama{" "}
                              {selectedEwalletData.owner}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QRIS */}
                    {paymentMethod === "qris" && (
                      <div className="rounded-3xl border border-violet-100 bg-gradient-to-b from-violet-50 to-fuchsia-50 p-5">
                        <div className="text-center">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                            QRIS Concertix
                          </p>

                          <h3 className="mt-2 text-lg font-black text-neutral-900">
                            Scan untuk membayar
                          </h3>

                          <p className="mt-1 text-sm text-neutral-500">
                            Scan QRIS di bawah menggunakan
                            aplikasi pembayaran kamu.
                          </p>

                          <div className="mx-auto mt-5 flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                            <img
                              src="/qris.png"
                              alt="QRIS Concertix"
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                e.currentTarget.parentElement.innerHTML = `
                                  <div class="flex h-full w-full flex-col items-center justify-center text-center">
                                    <div class="text-4xl">▦</div>
                                    <p class="mt-3 text-sm font-bold text-neutral-700">
                                      QRIS belum tersedia
                                    </p>
                                    <p class="mt-1 text-xs text-neutral-400">
                                      Tambahkan qris.png ke folder public
                                    </p>
                                  </div>
                                `;
                              }}
                            />
                          </div>

                          <div className="mt-4 rounded-2xl bg-white p-4 text-left">
                            <p className="text-xs text-neutral-400">
                              Total pembayaran
                            </p>

                            <p className="mt-1 text-xl font-black text-violet-600">
                              Rp {formattedTotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PAYMENT PROOF */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-neutral-800">
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
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
                      />

                      <p className="mt-2 text-xs leading-5 text-neutral-400">
                        Masukkan URL gambar bukti pembayaran
                        setelah melakukan transfer.
                      </p>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paying
                        ? "Mengirim Pembayaran..."
                        : "Saya Sudah Bayar →"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* SECURITY INFO */}
            <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  🔒
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    Pembayaran Aman
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Pastikan nominal dan rekening tujuan
                    sudah benar sebelum melakukan pembayaran.
                    Bukti pembayaran akan diverifikasi oleh
                    admin.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-neutral-900">
                Butuh melihat order lainnya?
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Kelola semua pesanan tiket kamu di halaman
                order.
              </p>
            </div>

            <Link
              to="/orders"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Lihat Semua Order →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}