import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});

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

    try {
      const response = await api.post(
        "/orders",
        {
          items: [
            {
              ticket_type_id: ticket.id,
              quantity,
            },
          ],
        }
      );

      console.log(
        "CREATE ORDER:",
        response.data
      );

      if (response.data.success) {
        localStorage.setItem(
          "currentOrder",
          JSON.stringify(
            response.data.data.order
          )
        );

        alert("Order berhasil dibuat!");

        window.location.href =
          `/orders/${response.data.data.order.id}`;
      }
    } catch (err) {
      console.error(
        "CREATE ORDER ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal membuat order.";

      alert(message);
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

            <div className="h-[560px] animate-pulse rounded-3xl bg-neutral-200" />

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
    <div className="min-h-screen overflow-hidden bg-white text-neutral-900">

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

      <section className="relative border-b border-neutral-200">

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:pt-36 lg:px-8">

        

          {/* HERO CONTENT */}

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[420px_1fr] lg:gap-16">

            {/* POSTER */}

            <div className="relative">

              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-violet-200 via-fuchsia-100 to-violet-200 blur-2xl" />

              <div className="group relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/70">

                {concert.poster ? (
                  <img
                    src={concert.poster}
                    alt={concert.title}
                    className="h-[560px] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-[560px] items-center justify-center bg-neutral-100 text-5xl text-neutral-300">
                    ♫
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                

              </div>

            </div>

            {/* INFO */}

            <div>

              

              {/* TITLE */}

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                {concert.title}
              </h1>

              {/* DESCRIPTION */}

              {concert.description && (
                <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                  {concert.description}
                </p>
              )}

              {/* META */}

              <div className="mt-9 grid gap-4 sm:grid-cols-2">

                {/* DATE */}

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600">
                      📅
                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Tanggal
                      </p>

                      <p className="mt-2 text-sm font-bold text-neutral-900">
                        {formatDate(
                          concert.concert_date
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* TIME */}

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-md">

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-lg text-fuchsia-600">
                      🕐
                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Waktu
                      </p>

                      {/* JAM TETAP DARI concert_time */}

                      <p className="mt-2 text-sm font-bold text-neutral-900">
                        {formatTime(
                          concert.concert_time
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* VENUE */}

                {concert.venues && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:col-span-2">

                    <div className="flex gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600">
                        📍
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Venue
                        </p>

                        <p className="mt-2 font-bold text-neutral-900">
                          {concert.venues.name}
                        </p>

                        {concert.venues.city && (
                          <p className="mt-1 text-sm text-neutral-500">
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
                <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Alamat
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
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

      <section className="relative bg-neutral-50">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

             
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
                Pilih Tiket
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Pilih kategori dan jumlah tiket
                yang ingin kamu beli.
              </p>

            </div>

            <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-500 shadow-sm">
              {ticketTypes.length} kategori tiket
            </div>

          </div>

          {/* TICKETS */}

          <div className="mt-10">

            {ticketTypes.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                  🎫
                </div>

                <h3 className="mt-5 text-lg font-bold text-neutral-900">
                  Belum ada tiket tersedia
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  Tiket untuk konser ini belum
                  tersedia.
                </p>

              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">

                {ticketTypes.map((ticket) => {

                  const stock =
                    Number(ticket.stock) || 0;

                  const sold =
                    Number(ticket.sold) || 0;

                  const available =
                    Math.max(
                      stock - sold,
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
                      className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition duration-300 ${
                        soldOut
                          ? "border-neutral-200 opacity-70"
                          : "border-neutral-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                      }`}
                    >

                      {!soldOut && (
                        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-100 blur-3xl transition group-hover:bg-fuchsia-100" />
                      )}

                      <div className="relative">

                        {/* HEADER */}

                        <div className="flex items-start justify-between gap-5">

                          <div>

                           
                            <h3 className="mt-2 text-2xl font-black text-neutral-950">
                              {ticket.name}
                            </h3>

                          </div>

                          <div className="text-right">

                            <p className="text-xs text-neutral-400">
                              Harga
                            </p>

                            <p className="mt-1 whitespace-nowrap text-lg font-black text-violet-600">
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
                          <p className="mt-4 text-sm leading-6 text-neutral-500">
                            {ticket.description}
                          </p>
                        )}

                        {/* STOCK */}

                        <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">

                          <div className="flex items-center justify-between">

                            <span className="text-sm text-neutral-500">
                              Ketersediaan
                            </span>

                            {soldOut ? (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                SOLD OUT
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                {available} tersedia
                              </span>
                            )}

                          </div>

                          {!soldOut && (
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">

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

                            <div className="mt-6 flex items-center justify-between">

                              <div>

                                <p className="text-sm font-semibold text-neutral-900">
                                  Jumlah Tiket
                                </p>

                                <p className="mt-1 text-xs text-neutral-400">
                                  Maks. {available}
                                </p>

                              </div>

                              <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-white">

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
                                  className="flex h-11 w-11 items-center justify-center text-xl text-neutral-600 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  −
                                </button>

                                <div className="flex h-11 w-12 items-center justify-center border-x border-neutral-200 font-bold text-neutral-900">
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
                                  className="flex h-11 w-11 items-center justify-center text-xl text-neutral-600 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  +
                                </button>

                              </div>

                            </div>

                            {/* SUBTOTAL */}

                            <div className="mt-6 flex items-end justify-between border-t border-neutral-200 pt-5">

                              <div>

                                <p className="text-xs uppercase tracking-wider text-neutral-400">
                                  Subtotal
                                </p>

                                <p className="mt-1 text-xs text-neutral-400">
                                  {quantity} tiket
                                </p>

                              </div>

                              <p className="text-2xl font-black text-neutral-950">
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
                              className="group/button relative mt-6 w-full overflow-hidden rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 hover:shadow-violet-300"
                            >

                              <span className="relative z-10 flex items-center justify-center gap-2">

                                Beli Tiket

                                <span className="transition-transform group-hover/button:translate-x-1">
                                  →
                                </span>

                              </span>

                            </button>

                          </>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="mt-6 w-full cursor-not-allowed rounded-2xl bg-neutral-200 py-4 font-bold text-neutral-400"
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

      <section className="border-t border-neutral-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="mb-10">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Why Concertix
            </p>

            <h2 className="mt-2 text-3xl font-black text-neutral-950">
              Nikmati pengalaman konser
              yang lebih mudah.
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* CARD 1 */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                ✓
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

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-lg">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                ◆
              </div>

              <h3 className="mt-5 font-bold text-neutral-900">
                Pembayaran Aman
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Bukti pembayaran akan diperiksa
                sebelum pesanan diproses.
              </p>

            </div>

            {/* CARD 3 */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                ⚡
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

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="border-t border-neutral-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-8 text-white shadow-2xl sm:p-10">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />

            <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-2xl font-black">
                  Siap menikmati konser?
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Jangan sampai kehabisan tiket
                  untuk event favoritmu.
                </p>

              </div>

             

              <button
                onClick={() => navigate("/#explore")}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-violet-100"
              >
                Lihat Konser Lainnya →
              </button>

            </div>

          </div>

        </div>

      </section>

     
    </div>
  );
}

export default ConcertDetail;