import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getConcerts = async () => {
      try {
        const response = await api.get("/concerts");

        setConcerts(response.data.data || []);
      } catch (err) {
        console.error("GET CONCERTS ERROR:", err);
        setError("Gagal mengambil data konser.");
      } finally {
        setLoading(false);
      }
    };

    getConcerts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950" />

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-sm font-medium tracking-wider text-violet-300">
                LIVE EVENT TICKETING
              </span>
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Temukan konser
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                favoritmu.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-400">
              Pesan tiket konser dengan mudah dan nikmati pengalaman musik
              yang tidak terlupakan bersama Concertix.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#concerts"
                className="rounded-xl bg-white px-6 py-3.5 font-semibold text-neutral-950 transition hover:bg-neutral-200"
              >
                Lihat Konser
              </a>

              <Link
                to="/register"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Buat Akun
              </Link>
            </div>

            <div className="mt-12 flex gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-bold">Easy</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Pemesanan mudah
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold">Secure</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Pembayaran aman
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold">Fast</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Proses cepat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONCERT SECTION
      ===================================================== */}
      <section
        id="concerts"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-violet-400">
              UPCOMING EVENTS
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Konser Mendatang
            </h2>

            <p className="mt-3 text-neutral-500">
              Temukan event musik yang ingin kamu datangi.
            </p>
          </div>

          {!loading && concerts.length > 0 && (
            <p className="text-sm text-neutral-500">
              {concerts.length} event tersedia
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="h-72 animate-pulse bg-white/5" />

                <div className="space-y-4 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && concerts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">
              Belum ada konser tersedia.
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Silakan kembali lagi nanti.
            </p>
          </div>
        )}

        {/* Concert Cards */}
        {!loading && !error && concerts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {concerts.map((concert) => (
              <div
                key={concert.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-white/[0.05]"
              >
                {/* Poster */}
                <div className="relative h-80 overflow-hidden bg-neutral-900">
                  <img
                    src={concert.poster}
                    alt={concert.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Status */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                      {concert.status || "Upcoming"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-medium text-violet-300">
                      {concert.concert_date}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="line-clamp-2 text-xl font-bold leading-snug">
                    {concert.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-neutral-400">
                    <p className="flex items-center gap-2">
                      <span>🕐</span>
                      {concert.concert_time}
                    </p>

                    {concert.venues && (
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        {concert.venues.name},{" "}
                        {concert.venues.city}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/concert/${concert.id}`}
                    className="mt-6 block rounded-xl bg-white py-3 text-center text-sm font-semibold text-neutral-950 transition hover:bg-violet-100"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER CTA
      ===================================================== */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            CONCERTIX
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Siap menikmati konser favoritmu?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-neutral-500">
            Buat akun sekarang dan mulai pesan tiket konser dengan mudah.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;