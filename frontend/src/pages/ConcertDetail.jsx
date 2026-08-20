import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ConcertDetail() {
  const { id } = useParams();

  const [concert, setConcert] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getConcertDetail = async () => {
      try {
        setLoading(true);
        setError("");

        // ===============================
        // DETAIL KONSER
        // ===============================
        const concertResponse = await api.get(`/concerts/${id}`);

        setConcert(concertResponse.data.data);

        // ===============================
        // TICKET TYPES
        // ===============================
        const ticketResponse = await api.get("/ticket-types");

        const allTickets = ticketResponse.data.data || [];

        const concertTickets = allTickets.filter(
          (ticket) =>
            Number(ticket.concert_id) === Number(id)
        );

        setTicketTypes(concertTickets);

        // Default quantity = 1
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

        setError("Gagal mengambil detail konser.");
      } finally {
        setLoading(false);
      }
    };

    getConcertDetail();
  }, [id]);

  // =====================================================
  // UBAH JUMLAH TIKET
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
  // BELI TIKET
  // =====================================================
const handleBuyTicket = async (ticket) => {
  const quantity = quantities[ticket.id] || 1;

  // ==========================================
  // CEK USER LOGIN
  // ==========================================
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    // Simpan tiket yang ingin dibeli
    localStorage.setItem(
      "selectedTicket",
      JSON.stringify({
        ticket_type_id: ticket.id,
        quantity,
        concert_id: concert.id,
      })
    );

    // Arahkan ke login
    window.location.href = "/login";
    return;
  }

  // ==========================================
  // BUAT ORDER
  // ==========================================
  try {
    const response = await api.post("/orders", {
      items: [
        {
          ticket_type_id: ticket.id,
          quantity,
        },
      ],
    });

    console.log("CREATE ORDER:", response.data);

    if (response.data.success) {
      // Simpan order untuk proses payment berikutnya
      localStorage.setItem(
        "currentOrder",
        JSON.stringify(response.data.data.order)
      );

     alert("Order berhasil dibuat!");

window.location.href = `/orders/${response.data.data.order.id}`;
    }
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);

    const message =
      err.response?.data?.message ||
      "Gagal membuat order.";

    alert(message);
  }
};

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-64 animate-pulse rounded bg-white/10" />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="h-[500px] animate-pulse rounded-3xl bg-white/5" />

            <div className="space-y-5">
              <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-14 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-24 animate-pulse rounded bg-white/10" />
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
      <div className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

          <Link
            to="/"
            className="mt-6 inline-block text-violet-400 hover:text-violet-300"
          >
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // KONSER TIDAK DITEMUKAN
  // =====================================================
  if (!concert) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold">
            Konser tidak ditemukan
          </h2>

          <Link
            to="/"
            className="mt-6 inline-block text-violet-400 hover:text-violet-300"
          >
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* =====================================================
          CONCERT HERO
      ===================================================== */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          {/* BACK */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
          >
            ← Kembali ke konser
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[420px_1fr]">

            {/* POSTER */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <img
                src={concert.poster}
                alt={concert.title}
                className="h-[560px] w-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex flex-col justify-center">

              <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
                UPCOMING EVENT
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {concert.title}
              </h1>

              {concert.description && (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
                  {concert.description}
                </p>
              )}

              {/* META */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-neutral-500">
                    Tanggal
                  </p>

                  <p className="mt-2 font-semibold">
                    {concert.concert_date}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-neutral-500">
                    Waktu
                  </p>

                  <p className="mt-2 font-semibold">
                    {concert.concert_time}
                  </p>
                </div>

                {concert.venues && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:col-span-2">
                    <p className="text-sm text-neutral-500">
                      Venue
                    </p>

                    <p className="mt-2 font-semibold">
                      {concert.venues.name}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {concert.venues.city}
                    </p>
                  </div>
                )}
              </div>

              {concert.venues?.address && (
                <div className="mt-5">
                  <p className="text-sm text-neutral-500">
                    Alamat
                  </p>

                  <p className="mt-1 text-neutral-300">
                    {concert.venues.address}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TICKETS
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            TICKETS
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Pilih Tiket
          </h2>

          <p className="mt-2 text-neutral-500">
            Pilih kategori dan jumlah tiket yang ingin kamu beli.
          </p>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">
              Belum ada tiket tersedia.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">

            {ticketTypes.map((ticket) => {
              const stock =
                Number(ticket.stock) || 0;

              const sold =
                Number(ticket.sold) || 0;

              const available = Math.max(
                stock - sold,
                0
              );

              const quantity =
                quantities[ticket.id] || 1;

              const subtotal =
                Number(ticket.price) *
                quantity;

              const soldOut =
                available <= 0;

              return (
                <div
                  key={ticket.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-500/30"
                >

                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-sm text-neutral-500">
                        TICKET TYPE
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        {ticket.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-neutral-500">
                        Harga
                      </p>

                      <p className="mt-1 text-xl font-bold text-violet-400">
                        Rp{" "}
                        {Number(
                          ticket.price
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* STOCK */}
                  <div className="mt-6 rounded-2xl bg-white/5 p-4">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">
                        Ketersediaan
                      </span>

                      {soldOut ? (
                        <span className="font-semibold text-red-400">
                          Sold Out
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-400">
                          {available} tiket tersedia
                        </span>
                      )}
                    </div>

                    {!soldOut && (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width: `${Math.min(
                              (available / stock) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* QUANTITY */}
                  {!soldOut && (
                    <>
                      <div className="mt-6 flex items-center justify-between">

                        <span className="text-sm text-neutral-400">
                          Jumlah tiket
                        </span>

                        <div className="flex items-center overflow-hidden rounded-xl border border-white/10">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                ticket.id
                              )
                            }
                            disabled={quantity <= 1}
                            className="h-11 w-11 text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            −
                          </button>

                          <div className="flex h-11 w-12 items-center justify-center border-x border-white/10 font-semibold">
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
                              quantity >= available
                            }
                            className="h-11 w-11 text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            +
                          </button>

                        </div>
                      </div>

                      {/* SUBTOTAL */}
                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">

                        <span className="text-neutral-500">
                          Subtotal
                        </span>

                        <span className="text-xl font-bold">
                          Rp{" "}
                          {subtotal.toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>

                      {/* BUY */}
                      <button
                        type="button"
                        onClick={() =>
                          handleBuyTicket(ticket)
                        }
                        className="mt-6 w-full rounded-xl bg-white py-3.5 font-semibold text-neutral-950 transition hover:bg-violet-100"
                      >
                        Beli Tiket
                      </button>
                    </>
                  )}

                  {soldOut && (
                    <button
                      type="button"
                      disabled
                      className="mt-6 w-full cursor-not-allowed rounded-xl bg-white/10 py-3.5 font-semibold text-neutral-500"
                    >
                      Tiket Habis
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default ConcertDetail;