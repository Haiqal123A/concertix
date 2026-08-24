import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  // =========================================================
  // CATEGORY
  // =========================================================

  const categories = useMemo(() => {
    const categoryList = concerts
      .map((concert) => {
        return (
          concert.category?.name ||
          concert.categories?.name ||
          concert.category_name ||
          null
        );
      })
      .filter(Boolean);

    return ["All", ...new Set(categoryList)];
  }, [concerts]);

  // =========================================================
  // FILTER CONCERTS
  // =========================================================

  const filteredConcerts = useMemo(() => {
    return concerts.filter((concert) => {
      const title = concert.title?.toLowerCase() || "";

      const artist =
        concert.artist?.name?.toLowerCase() ||
        concert.artists?.name?.toLowerCase() ||
        concert.artist_name?.toLowerCase() ||
        "";

      const category =
        concert.category?.name ||
        concert.categories?.name ||
        concert.category_name ||
        "";

      const keyword = search.toLowerCase();

      const matchesSearch =
        title.includes(keyword) || artist.includes(keyword);

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [concerts, search, selectedCategory]);

  // =========================================================
  // FEATURED
  // =========================================================

  const featuredConcert = concerts[0];

  // =========================================================
  // STATS
  // =========================================================

  const totalConcerts = concerts.length;

  const totalCategories = categories.length > 1 ? categories.length - 1 : 0;

  const totalVenues = new Set(
    concerts
      .map((concert) => concert.venues?.name || concert.venue?.name)
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950" />

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute -left-40 top-1/2 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Hero Text */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />

                <span className="text-xs font-semibold tracking-[0.2em] text-violet-300">
                  LIVE EVENT TICKETING
                </span>
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Your next
                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  unforgettable
                </span>

                <br />

                concert.
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
                Temukan konser favoritmu, pilih tiket yang sesuai, dan nikmati
                pengalaman event terbaik bersama Concertix.
              </p>

              {/* Search */}

              <div className="mt-9 max-w-xl">
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl">
                  <span className="px-3 text-xl text-neutral-500">⌕</span>

                  <input
                    type="text"
                    placeholder="Cari konser atau artist..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-neutral-600"
                  />

                  <a
                    href="#explore"
                    className="hidden rounded-xl bg-white px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-violet-100 sm:block"
                  >
                    Explore
                  </a>
                </div>
              </div>

              {/* Hero Buttons */}

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#explore"
                  className="rounded-xl bg-white px-6 py-3.5 font-semibold text-neutral-950 transition hover:bg-neutral-200"
                >
                  Explore Concert
                </a>

                <Link
                  to="/orders"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  My Orders
                </Link>
              </div>

              {/* Stats */}

              <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-white/10 pt-8">
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? "-" : totalConcerts}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Concerts
                  </p>
                </div>

                <div className="border-l border-white/10 pl-5">
                  <p className="text-2xl font-bold">
                    {loading ? "-" : totalCategories}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Categories
                  </p>
                </div>

                <div className="border-l border-white/10 pl-5">
                  <p className="text-2xl font-bold">
                    {loading ? "-" : totalVenues}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Venues
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Concert */}

            <div className="hidden lg:block">
              {featuredConcert && (
                <Link
                  to={`/concert/${featuredConcert.id}`}
                  className="group relative block overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl"
                >
                  <div className="relative h-[560px]">
                    <img
                      src={featuredConcert.poster}
                      alt={featuredConcert.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute left-6 top-6">
                      <span className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
                        Featured Event
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <p className="mb-2 text-sm font-semibold text-violet-300">
                        {featuredConcert.concert_date}
                      </p>

                      <h2 className="text-3xl font-bold">
                        {featuredConcert.title}
                      </h2>

                      {featuredConcert.venues && (
                        <p className="mt-3 text-sm text-neutral-300">
                          📍 {featuredConcert.venues.name},{" "}
                          {featuredConcert.venues.city}
                        </p>
                      )}

                      <div className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-neutral-950 transition group-hover:bg-violet-100">
                        View Concert →
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPLORE
      ===================================================== */}

      <section
        id="explore"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-violet-400">
              EXPLORE
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find your next event
            </h2>

            <p className="mt-3 text-neutral-500">
              Jelajahi berbagai konser dan event yang tersedia.
            </p>
          </div>

          {!loading && (
            <p className="text-sm text-neutral-500">
              {filteredConcerts.length} event ditemukan
            </p>
          )}
        </div>

        {/* Search + Categories */}

        <div className="mb-10 flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4">
            <span className="mr-3 text-neutral-500">⌕</span>

            <input
              type="text"
              placeholder="Search concert..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-neutral-600"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-white text-neutral-950"
                    : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {category === "All" ? "All Events" : category}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="h-80 animate-pulse bg-white/5" />

                <div className="space-y-4 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          filteredConcerts.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-14 text-center">
              <div className="text-4xl">🎫</div>

              <h3 className="mt-4 text-lg font-semibold">
                Konser tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Coba gunakan kata kunci atau kategori yang berbeda.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950"
              >
                Reset Filter
              </button>
            </div>
          )}

        {/* =====================================================
            CONCERT GRID
        ===================================================== */}

        {!loading &&
          !error &&
          filteredConcerts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredConcerts.map((concert) => {
                const category =
                  concert.category?.name ||
                  concert.categories?.name ||
                  concert.category_name;

                const artist =
                  concert.artist?.name ||
                  concert.artists?.name ||
                  concert.artist_name;

                return (
                  <Link
                    key={concert.id}
                    to={`/concert/${concert.id}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-white/[0.05]"
                  >
                    {/* Poster */}

                    <div className="relative h-80 overflow-hidden bg-neutral-900">
                      <img
                        src={concert.poster}
                        alt={concert.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute left-4 top-4">
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                          {concert.status || "Upcoming"}
                        </span>
                      </div>

                      {category && (
                        <div className="absolute bottom-4 left-4">
                          <span className="rounded-full bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur">
                            {category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}

                    <div className="p-5">
                      <p className="text-sm font-medium text-violet-400">
                        {concert.concert_date}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-snug">
                        {concert.title}
                      </h3>

                      {artist && (
                        <p className="mt-2 text-sm text-neutral-400">
                          🎤 {artist}
                        </p>
                      )}

                      <div className="mt-4 space-y-2 text-sm text-neutral-500">
                        {concert.concert_time && (
                          <p>🕐 {concert.concert_time}</p>
                        )}

                        {concert.venues && (
                          <p>
                            📍 {concert.venues.name},{" "}
                            {concert.venues.city}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-semibold text-white">
                          View Details
                        </span>

                        <span className="text-lg text-violet-400 transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </section>

      {/* =====================================================
          WHY CONCERTIX
      ===================================================== */}

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
              WHY CONCERTIX
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Semua kebutuhan konsermu,
              <br />
              dalam satu tempat.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="text-3xl">🎟️</div>

              <h3 className="mt-5 text-lg font-bold">
                Easy Ticketing
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Temukan konser dan pilih tiket dengan proses yang sederhana.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="text-3xl">🔒</div>

              <h3 className="mt-5 text-lg font-bold">
                Secure Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Proses pemesanan dan pembayaran dibuat agar lebih aman.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="text-3xl">⚡</div>

              <h3 className="mt-5 text-lg font-bold">
                Fast Experience
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Dari menemukan event sampai mendapatkan tiket dengan cepat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/50 to-fuchsia-950/30" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            CONCERTIX
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Your next concert
            <br />
            starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-neutral-400">
            Jelajahi event yang tersedia dan temukan pengalaman musik
            berikutnya.
          </p>

          <a
            href="#explore"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Explore Events
          </a>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-bold text-white">CONCERTIX</p>

            <p className="mt-1">
              Your gateway to unforgettable events.
            </p>
          </div>

          <div className="flex gap-5">
            <Link
              to="/orders"
              className="transition hover:text-white"
            >
              My Orders
            </Link>

            <Link
              to="/"
              className="transition hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;