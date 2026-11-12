import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import api from "../services/api";

function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [buyer, setBuyer] = useState(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return {
        name: user.name || "",
        email: user.email || "",
      };
    } catch {
      return { name: "", email: "" };
    }
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET CONCERT DETAIL
  // =====================================================

  useEffect(() => {
    const getConcertDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const concertResponse = await api.get(`/concerts/${id}`);

        setConcert(concertResponse.data.data);

        const ticketResponse = await api.get("/ticket-types");

        const allTickets = ticketResponse.data.data || [];

        const concertTickets = allTickets.filter(
          (ticket) =>
            Number(ticket.concert_id) === Number(id)
        );

        setTicketTypes(concertTickets);

        const initialQuantities = {};

        concertTickets.forEach((ticket) => {
          initialQuantities[ticket.id] = 1;
        });

        setQuantities(initialQuantities);
      } catch (err) {
        console.error(
          "GET CONCERT DETAIL ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Gagal mengambil detail konser."
        );
      } finally {
        setLoading(false);
      }
    };

    getConcertDetail();
  }, [id]);

  useEffect(() => {
    let active = true;

    api
      .get("/payments/config")
      .then((response) => {
        if (active) setPaymentConfig(response.data.data);
      })
      .catch((err) => {
        console.error("GET PAYMENT CONFIG ERROR:", err);
        if (active) {
          setPaymentConfigError(
            "Status pembayaran belum dapat diperiksa. Coba lagi nanti."
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // =====================================================
  // QUANTITY
  // =====================================================

  const decreaseQuantity = (ticketId) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(
        (prev[ticketId] || 1) - 1,
        1
      ),
    }));
  };

  const increaseQuantity = (
    ticketId,
    available
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.min(
        (prev[ticketId] || 1) + 1,
        available
      ),
    }));
  };

  // =====================================================
  // BUY TICKET
  // =====================================================

  const handleBuyTicket = async (ticket) => {
    const quantity =
      quantities[ticket.id] || 1;

    const token =
      sessionStorage.getItem("token");

    const user =
      sessionStorage.getItem("user");

    if (!token || !user) {
      localStorage.setItem(
        "selectedTicket",
        JSON.stringify({
          ticket_type_id: ticket.id,
          quantity,
          concert_id: concert.id,
        })
      );

      window.location.href = "/login";
      return;
    }

    setCheckoutError("");
    setSelectedTicket({ ticket, quantity });
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (!selectedTicket || submittingOrder) return;

    try {
      setSubmittingOrder(true);
      setCheckoutError("");
      const response = await api.post(
        "/orders",
        {
          customer_name: buyer.name,
          customer_email: buyer.email,
          items: [
            {
              ticket_type_id: selectedTicket.ticket.id,
              quantity: selectedTicket.quantity,
            },
          ],
        }
      );

      console.log(
        "CREATE ORDER:",
        response.data
      );

      if (response.data.success) {
        const order = response.data.data.order;
        localStorage.setItem(
          "currentOrder",
          JSON.stringify(order)
        );

        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);
      setCheckoutError(
        err.response?.data?.message || "Gagal membuat order."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) return "-";

    // Jika backend mengirim "19:30:00"
    // tampilkan menjadi "19:30"
    if (
      typeof time === "string" &&
      /^\d{2}:\d{2}:\d{2}$/.test(time)
    ) {
      return time.substring(0, 5);
    }

    // Jika backend mengirim "19:30"
    if (
      typeof time === "string" &&
      /^\d{2}:\d{2}$/.test(time)
    ) {
      return time;
    }

    return time;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">

        {/* Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-100 blur-3xl" />

          <div className="absolute -right-40 top-[20%] h-[450px] w-[450px] rounded-full bg-fuchsia-100 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">

          <div className="h-5 w-36 animate-pulse rounded bg-neutral-200" />

          <div className="mt-8 grid gap-10 lg:grid-cols-[440px_1fr]">

            <div className="h-[320px] animate-pulse rounded-3xl bg-neutral-200 sm:h-[560px]" />

            <div className="flex flex-col justify-center">

              <div className="h-4 w-36 animate-pulse rounded bg-neutral-200" />

              <div className="mt-5 h-16 w-3/4 animate-pulse rounded bg-neutral-200" />

              <div className="mt-5 h-24 animate-pulse rounded bg-neutral-200" />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="h-24 animate-pulse rounded-2xl bg-neutral-200" />

                <div className="h-24 animate-pulse rounded-2xl bg-neutral-200" />

                <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 sm:col-span-2" />

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 py-24 text-neutral-900">

        <div className="relative mx-auto max-w-5xl">

          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />

          <div className="relative rounded-3xl border border-red-200 bg-red-50 p-8">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl font-black text-red-500">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Terjadi Kesalahan
            </h1>

            <p className="mt-2 text-neutral-600">
              {error}
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex items-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
            >
              ← Kembali ke Home
            </Link>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!concert) {
    return (
      <div className="min-h-screen bg-white px-6 py-24 text-neutral-900">

        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
              ♫
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Konser tidak ditemukan
            </h2>

            <p className="mt-2 text-neutral-500">
              Konser yang kamu cari mungkin
              sudah tidak tersedia.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
            >
              ← Kembali ke Home
            </Link>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f6fb] text-slate-900">
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submittingOrder) {
              setSelectedTicket(null);
            }
          }}
        >
          <form
            onSubmit={handleCreateOrder}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
              Data pemesan
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Lengkapi data sebelum membeli
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nama dan email ini akan digunakan pada detail tiket dan
              pembayaran.
            </p>

            <label
              htmlFor="buyer-name"
              className="mt-6 block text-sm font-semibold text-slate-700"
            >
              Nama lengkap
            </label>
            <input
              id="buyer-name"
              name="customer_name"
              type="text"
              autoComplete="name"
              minLength={3}
              maxLength={120}
              required
              value={buyer.name}
              onChange={(event) =>
                setBuyer((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

            <label
              htmlFor="buyer-email"
              className="mt-4 block text-sm font-semibold text-slate-700"
            >
              Email aktif
            </label>
            <input
              id="buyer-email"
              name="customer_email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={buyer.email}
              onChange={(event) =>
                setBuyer((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Pastikan email bisa menerima pesan. Saat ini aplikasi memeriksa
              format email, tetapi belum mengirim kode verifikasi.
            </p>

            {checkoutError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {checkoutError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                disabled={submittingOrder}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submittingOrder}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
              >
                {submittingOrder ? "Membuat order..." : "Lanjut ke pembayaran"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-violet-100/70 blur-3xl" />

        <div className="absolute -right-40 top-[20%] h-[500px] w-[500px] rounded-full bg-fuchsia-100/70 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[30%] h-[450px] w-[450px] rounded-full bg-violet-50 blur-3xl" />

      </div>

      
    

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative mx-3 mt-20 overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950 text-white shadow-xl shadow-violet-950/10 sm:mx-6 sm:mt-24 sm:rounded-[28px] xl:mx-auto xl:max-w-[1360px]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-[35%] top-[35%] h-40 w-40 rounded-full bg-purple-500/15 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 lg:pb-16 lg:pt-10">

          <Link
            to="/concerts"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft size={16} />
            Semua konser
          </Link>

          {/* HERO CONTENT */}

          <div className="mt-7 grid items-center gap-7 sm:mt-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

            {/* POSTER */}

            <div className="relative lg:order-2">

              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-violet-600/30 blur-2xl" />

              <div className="group relative overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_35px_100px_rgba(76,29,149,0.18)] ring-1 ring-slate-200/60">

                {concert.poster ? (
                  <img
                    src={concert.poster}
                    alt={concert.title}
                    className="h-[240px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[520px] lg:h-[600px]"
                  />
                ) : (
                  <div className="flex h-[240px] items-center justify-center bg-slate-900 text-slate-600 sm:h-[520px] lg:h-[600px]">
                    <Ticket size={64} strokeWidth={1.2} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/10" />

              </div>

            </div>

            {/* INFO */}

            <div className="lg:order-1">

              

          

              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl lg:text-[64px]">
                {concert.title}
              </h1>

              {/* DESCRIPTION */}

              {concert.description && (
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                  {concert.description}
                </p>
              )}

              <a
                href="#tickets"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-1 hover:bg-violet-600"
              >
                <Ticket size={17} />
                Lihat pilihan tiket
                <ArrowRight size={16} />
              </a>

              {/* META */}

              <div className="mt-9 grid gap-3 sm:grid-cols-2">

                {/* DATE */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-300/40 sm:p-5">

                  <div className="flex gap-3 sm:gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 sm:h-11 sm:w-11">
                      <CalendarDays size={20} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    </div>

                    <div>

                      <p className="mt-2 text-sm font-bold text-white">
                        {formatDate(
                          concert.concert_date
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* TIME */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-fuchsia-300/40 sm:p-5">

                  <div className="flex gap-3 sm:gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300 sm:h-11 sm:w-11">
                      <Clock3 size={20} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    </div>

                    <div>

                      {/* JAM TETAP DARI concert_time */}

                      <p className="mt-2 text-sm font-bold text-white">
                        {formatTime(
                          concert.concert_time
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* VENUE */}

                {concert.venues && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-300/40 sm:col-span-2 sm:p-5">

                    <div className="flex gap-3 sm:gap-4">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 sm:h-11 sm:w-11">
                        <MapPin size={20} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                      </div>

                      <div>
                        <p className="mt-2 font-bold text-white">
                          {concert.venues.name}
                        </p>

                        {concert.venues.city && (
                          <p className="mt-1 text-sm text-slate-400">
                            {concert.venues.city}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                )}

              </div>

              {/* ADDRESS */}

              {concert.venues?.address && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:mt-5 sm:p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Alamat
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {concert.venues.address}
                  </p>

                </div>
              )}

          </div>

        </div>

        </div>
      </section>

      {/* =================================================
          TICKETS
      ================================================= */}

      <section
        id="tickets"
        className="relative scroll-mt-24 bg-slate-100/80 py-8 sm:py-12"
      >

        <div className="mx-3 max-w-[1360px] rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:mx-6 sm:rounded-[28px] sm:p-8 lg:p-10 xl:mx-auto">

          {/* HEADER */}

          <div className="flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Pilih Tiket
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Pilih kategori, tentukan jumlah, lalu lanjutkan pembayaran
                dengan aman.
              </p>

            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
              <Ticket size={16} className="text-violet-600" />
              {ticketTypes.length} kategori tiket
            </div>

          </div>

          {!paymentConfig?.isConfigured && (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"
            >
              {paymentConfigError ||
                "Checkout sementara belum tersedia karena pembayaran Midtrans belum aktif."}
            </div>
          )}

          {/* TICKETS */}

          <div className="mt-6 sm:mt-10">

            {ticketTypes.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <Ticket size={28} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Belum ada tiket tersedia
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Tiket untuk konser ini belum
                  tersedia.
                </p>

              </div>
            ) : (
              <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">

                {ticketTypes.map((ticket) => {

                  const stock =
                    Number(ticket.stock) || 0;

                  const sold =
                    Number(ticket.sold) || 0;
                  const reserved =
                    Number(ticket.reserved) || 0;

                  const available =
                    Math.max(
                      stock - sold - reserved,
                      0
                    );

                  const quantity =
                    quantities[ticket.id] || 1;

                  const subtotal =
                    Number(ticket.price || 0) *
                    quantity;

                  const soldOut =
                    available <= 0;

                  const stockPercentage =
                    stock > 0
                      ? Math.min(
                          (available / stock) *
                            100,
                          100
                        )
                      : 0;

                  return (
                    <div
                      key={ticket.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition duration-300 sm:rounded-3xl sm:p-7 ${
                        soldOut
                          ? "border-slate-200 opacity-70"
                          : "border-slate-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(91,33,182,0.10)]"
                      }`}
                    >

                      {!soldOut && (
                        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-100/80 blur-3xl transition group-hover:bg-fuchsia-100/80" />
                      )}

                      <div className="relative">

                        {/* HEADER */}

                        <div className="flex items-center justify-between gap-2 sm:items-start sm:gap-5">

                          <div className="flex min-w-0 flex-1 items-center gap-2 sm:block">

                           
                            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
                              <Ticket size={19} />
                            </div>

                            <h3 className="min-w-0 break-words text-base font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                              {ticket.name}
                            </h3>

                          </div>

                          <div className="shrink-0 rounded-xl bg-violet-50 px-2.5 py-2 text-right sm:rounded-2xl sm:px-4 sm:py-3">

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                              Harga
                            </p>

                            <p className="mt-1 whitespace-nowrap text-sm font-black text-violet-700 sm:text-lg">
                              Rp{" "}
                              {Number(
                                ticket.price || 0
                              ).toLocaleString(
                                "id-ID"
                              )}
                            </p>

                          </div>

                        </div>

                        {/* DESCRIPTION */}

                        {ticket.description && (
                          <p className="mt-3 text-sm leading-5 text-slate-500 sm:mt-4 sm:leading-6">
                            {ticket.description}
                          </p>
                        )}

                        {/* STOCK */}

                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:mt-7 sm:rounded-2xl sm:p-4">

                          <div className="flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-500">
                              Ketersediaan
                            </span>

                            {soldOut ? (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                SOLD OUT
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                {available} tersedia
                              </span>
                            )}

                          </div>

                          {!soldOut && (
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">

                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300"
                                style={{
                                  width: `${stockPercentage}%`,
                                }}
                              />

                            </div>
                          )}

                        </div>

                        {/* BUY */}

                        {!soldOut ? (
                          <>

                            {/* QUANTITY */}

                            <div className="mt-4 flex items-center justify-between sm:mt-6">

                              <div>

                                <p className="text-sm font-semibold text-slate-900">
                                  Jumlah Tiket
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Maks. {available}
                                </p>

                              </div>

                              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      ticket.id
                                    )
                                  }
                                  disabled={
                                    quantity <= 1
                                  }
                                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Minus size={16} />
                                </button>

                                <div className="flex h-11 w-12 items-center justify-center border-x border-slate-200 font-bold text-slate-900">
                                  {quantity}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      ticket.id,
                                      available
                                    )
                                  }
                                  disabled={
                                    quantity >=
                                    available
                                  }
                                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Plus size={16} />
                                </button>

                              </div>

                            </div>

                            {/* SUBTOTAL */}

                            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5">

                              <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                  Subtotal
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {quantity} tiket
                                </p>

                              </div>

                              <p className="text-right text-lg font-black tracking-tight text-slate-950 sm:text-2xl">
                                Rp{" "}
                                {subtotal.toLocaleString(
                                  "id-ID"
                                )}
                              </p>

                            </div>

                            {/* BUY BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                handleBuyTicket(
                                  ticket
                                )
                              }
                              disabled={!paymentConfig?.isConfigured}
                              className="group/button relative mt-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-violet-600 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-violet-700 hover:shadow-violet-300 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none sm:mt-6 sm:py-4"
                            >

                              <span className="relative z-10 flex items-center justify-center gap-2">

                                {paymentConfig?.isConfigured
                                  ? "Beli Tiket"
                                  : "Pembayaran belum tersedia"}

                                {paymentConfig?.isConfigured && (
                                  <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover/button:translate-x-1"
                                  />
                                )}

                              </span>

                            </button>

                          </>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="mt-4 w-full cursor-not-allowed rounded-2xl bg-slate-100 py-3 font-bold text-slate-400 sm:mt-6 sm:py-4"
                          >
                            Tiket Habis
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          WHY CONCERTIX
      ================================================= */}

      <section className="border-t border-slate-200 bg-slate-100/80">

        <div className="mx-3 max-w-[1360px] py-10 sm:mx-6 sm:py-16 xl:mx-auto">

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">

            <div className="mb-8 max-w-3xl">

              <h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Semua yang kamu butuhkan untuk menikmati konser.
              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {/* CARD 1 */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Check size={20} />
                </div>

                <h3 className="mt-5 font-bold text-neutral-900">
                  Tiket Resmi
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Pesan tiket konser melalui
                  Concertix dengan proses yang
                  praktis dan mudah.
                </p>

              </div>

              {/* CARD 2 */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-lg sm:p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                  <ShieldCheck size={20} />
                </div>

                <h3 className="mt-5 font-bold text-neutral-900">
                  Pembayaran Aman
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Pembayaran diproses melalui Midtrans untuk pengalaman checkout
                  yang aman.
                </p>

              </div>

              {/* CARD 3 */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Clock3 size={20} />
                </div>

                <h3 className="mt-5 font-bold text-neutral-900">
                  Cepat & Simple
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Pilih tiket, buat order, dan
                  lanjutkan pembayaran dalam
                  beberapa langkah.
                </p>

              </div>

            </div>
          </div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="border-t border-slate-200 bg-slate-100/80">

        <div className="mx-3 max-w-[1360px] pb-10 sm:mx-6 sm:pb-16 xl:mx-auto">

          <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 text-slate-900 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-10">

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-100 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-fuchsia-100/80 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xl font-black sm:text-2xl">
                  Siap menikmati malam yang tak terlupakan?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Jangan sampai kehabisan tiket
                  untuk event favoritmu.
                </p>

              </div>

             

              <button
                onClick={() => navigate("/#explore")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
              >
                Lihat konser lainnya <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </div>

      </section>

     
    </div>
  );
}

export default ConcertDetail;