import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // =====================================================
  // GET CONCERTS
  // =====================================================

  useEffect(() => {
    const getConcerts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/concerts");

        setConcerts(response.data.data || []);
      } catch (err) {
        console.error("GET CONCERTS ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data konser."
        );
      } finally {
        setLoading(false);
      }
    };

    getConcerts();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const categoryList = concerts
      .map(
        (concert) =>
          concert.category?.name ||
          concert.categories?.name ||
          concert.category_name ||
          null
      )
      .filter(Boolean);

    return ["All", ...new Set(categoryList)];
  }, [concerts]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredConcerts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

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

      const matchesSearch =
        title.includes(keyword) ||
        artist.includes(keyword);

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [concerts, search, selectedCategory]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const featuredConcert = concerts[0];

  const totalConcerts = concerts.length;

  const totalCategories =
    categories.length > 1
      ? categories.length - 1
      : 0;

  const totalVenues = new Set(
    concerts
      .map(
        (concert) =>
          concert.venues?.name ||
          concert.venue?.name
      )
      .filter(Boolean)
  ).size;

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilter = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-violet-200 selection:text-violet-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden pt-24">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50" />

        <div className="absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-violet-300/25 blur-[120px]" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-300/20 blur-[120px]" />

        <div className="absolute right-[35%] top-[35%] h-40 w-40 rounded-full bg-purple-300/20 blur-[80px]" />

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">

          {/* =================================================
              HERO GRID
          ================================================= */}

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div>

              {/* Heading */}

              <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[76px]">

                Your next

                <br />

                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                  unforgettable
                </span>

                <br />

                concert.

              </h1>

              {/* Description */}

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">

                Temukan konser favoritmu, pilih tiket
                yang sesuai, dan nikmati pengalaman
                event terbaik bersama{" "}

                <span className="font-black text-violet-600">
                  Concertix.
                </span>

              </p>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="mt-6 flex flex-wrap gap-3">

                

                <a
                  href="#explore"
                  className="group rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 hover:bg-violet-600"
                >
                  Explore Concert

                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </a>

                <Link
                  to="/orders"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-violet-300 hover:text-violet-600"
                >
                  My Orders
                </Link>

              </div>

              {/* =================================================
                  STATS
              ================================================= */}

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">

                {/* =================================================
                    CONCERTS
                ================================================= */}

                <div
                  className="
                    group rounded-2xl
                    border border-white/70
                    bg-white/70
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-violet-200
                    hover:shadow-[0_18px_45px_rgba(124,58,237,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-violet-50
                        text-violet-600
                        transition-transform duration-300
                        group-hover:scale-110
                      "
                    >
                      <span className="text-sm">
                        ♫
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Events
                    </span>

                  </div>

                  <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "-" : totalConcerts}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Concerts
                  </p>

                </div>

                {/* =================================================
                    CATEGORIES
                ================================================= */}

                <div
                  className="
                    group rounded-2xl
                    border border-white/70
                    bg-white/70
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-fuchsia-200
                    hover:shadow-[0_18px_45px_rgba(217,70,239,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-fuchsia-50
                        text-fuchsia-600
                        transition-transform duration-300
                        group-hover:scale-110
                      "
                    >
                      <span className="text-sm">
                        ✦
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Variety
                    </span>

                  </div>

                  <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "-" : totalCategories}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Categories
                  </p>

                </div>

                {/* =================================================
                    VENUES
                ================================================= */}

                <div
                  className="
                    group rounded-2xl
                    border border-white/70
                    bg-white/70
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-indigo-200
                    hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-indigo-50
                        text-indigo-600
                        transition-transform duration-300
                        group-hover:scale-110
                      "
                    >
                      <span className="text-sm">
                        ⌖
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Places
                    </span>

                  </div>

                  <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "-" : totalVenues}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Venues
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                FEATURED CONCERT
            ================================================= */}

            <div className="hidden lg:block">

              {featuredConcert ? (

                <Link
                  to={`/concert/${featuredConcert.id}`}
                  className="group relative block overflow-hidden rounded-[36px] border border-white bg-white shadow-[0_35px_100px_rgba(76,29,149,0.18)] ring-1 ring-slate-200/60"
                >

                  <div className="relative h-[600px]">

                    <img
                      src={featuredConcert.poster}
                      alt={featuredConcert.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Featured Badge */}

                    <div className="absolute right-6 top-6">

                      <span className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                        Featured Event
                      </span>

                    </div>

                    {/* Content */}

                    <div className="absolute bottom-0 left-0 right-0 p-9">

                      <p className="mb-3 text-sm font-bold text-violet-300">
                        {featuredConcert.concert_date}
                      </p>

                      <h2 className="text-3xl font-black leading-tight text-white">
                        {featuredConcert.title}
                      </h2>

                      {featuredConcert.venues && (
                        <p className="mt-3 text-sm text-white/75">
                          📍 {featuredConcert.venues.name},{" "}
                          {featuredConcert.venues.city}
                        </p>
                      )}

                      <div className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition group-hover:bg-violet-100">

                        View Concert

                        <span className="ml-2 transition group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </div>

                  </div>

                </Link>

              ) : (

                <div className="flex h-[600px] items-center justify-center rounded-[36px] bg-slate-100">

                  <p className="text-sm font-semibold text-slate-400">
                    Belum ada featured concert.
                  </p>

                </div>

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
        className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8"
      >

        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Find your next event
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Jelajahi berbagai konser dan event yang tersedia.
            </p>

          </div>

          {!loading && (
            <div className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
              {filteredConcerts.length} event ditemukan
            </div>
          )}

        </div>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}

            <div className="flex flex-1 items-center rounded-xl bg-slate-50 px-4 ring-1 ring-inset ring-slate-100">

              <span className="mr-3 text-lg">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search concert..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />

            </div>

            {/* Categories */}

            <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[55%]">

              {categories.map((category) => (

                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                    selectedCategory === category
                      ? "bg-slate-950 text-white shadow-lg"
                      : "border border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >

                  {category === "All"
                    ? "All Events"
                    : category}

                </button>

              ))}

            </div>

          </div>

        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
              >

                <div className="h-[330px] animate-pulse bg-slate-100" />

                <div className="space-y-4 p-6">

                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && !loading && (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600">
            {error}
          </div>

        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          filteredConcerts.length === 0 && (

            <div className="rounded-[28px] border border-slate-200 bg-white p-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                🎫
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950">
                Konser tidak ditemukan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Coba gunakan kata kunci atau kategori
                yang berbeda.
              </p>

              <button
                onClick={resetFilter}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
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

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

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
                    className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-violet-200 hover:shadow-[0_25px_60px_rgba(76,29,149,0.14)]"
                  >

                    {/* Poster */}

                    <div className="relative h-[330px] overflow-hidden bg-slate-100">

                      <img
                        src={concert.poster}
                        alt={concert.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      {/* Status */}

                      <div className="absolute left-4 top-4">

                        <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xl">
                          {concert.status || "Upcoming"}
                        </span>

                      </div>

                      {/* Category */}

                      {category && (

                        <div className="absolute bottom-4 left-4">

                          <span className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            {category}
                          </span>

                        </div>

                      )}

                    </div>

                    {/* Info */}

                    <div className="p-6 sm:p-7">

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-600">
                        {concert.concert_date}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-xl font-black leading-snug tracking-tight text-slate-950">
                        {concert.title}
                      </h3>

                      {artist && (

                        <p className="mt-3 text-sm font-medium text-slate-500">
                          🎤 {artist}
                        </p>

                      )}

                      <div className="mt-5 space-y-2 text-sm text-slate-500">

                        {concert.concert_time && (
                          <p>
                            🕐 {concert.concert_time}
                          </p>
                        )}

                        {concert.venues && (
                          <p>
                            📍 {concert.venues.name},{" "}
                            {concert.venues.city}
                          </p>
                        )}

                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                        <span className="text-sm font-bold text-slate-700">
                          View Details
                        </span>

                        <span className="text-lg font-bold text-violet-600 transition group-hover:translate-x-1">
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

      <section
        id="why"
        className="border-y border-slate-200 bg-slate-100/70"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">

          <div className="max-w-2xl">

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Semua kebutuhan konsermu,
              <br />
              dalam satu tempat.
            </h2>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">

            {/* =================================================
                CARD 1
            ================================================= */}

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl transition group-hover:scale-110">
                🎟️
              </div>

              <h3 className="mt-6 text-lg font-black text-slate-950">
                Easy Ticketing
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Temukan konser dan pilih tiket dengan
                proses yang sederhana.
              </p>

            </div>

            {/* =================================================
                CARD 2
            ================================================= */}

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl transition group-hover:scale-110">
                🔒
              </div>

              <h3 className="mt-6 text-lg font-black text-slate-950">
                Secure Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Proses pemesanan dan pembayaran dibuat
                agar lebih aman.
              </p>

            </div>

            {/* =================================================
                CARD 3
            ================================================= */}

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl transition group-hover:scale-110">
                ⚡
              </div>

              <h3 className="mt-6 text-lg font-black text-slate-950">
                Fast Experience
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dari menemukan event sampai mendapatkan
                tiket dengan cepat.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950">

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-600/25 blur-[80px]" />

        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-6">

          <p className="text-xs font-extrabold tracking-[0.22em] text-violet-300">
            CONCERTIX
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your next concert
            <br />
            starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Jelajahi event yang tersedia dan temukan
            pengalaman musik berikutnya.
          </p>

          <a
            href="#explore"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-violet-100"
          >
            Explore Events

            <span className="ml-2">
              →
            </span>

          </a>

        </div>

      </section>



    </div>
  );
}

export default Home;