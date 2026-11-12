import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";
import api from "../services/api";

const formatConcertDate = (date) => {
  if (!date) return "Tanggal belum tersedia";
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Tanggal belum tersedia";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // STATISTICS
  // =====================================================

  const activeConcerts = concerts
    .filter((concert) =>
      ["upcoming", "ongoing"].includes(concert.status || "upcoming")
    )
    .slice(0, 3);

  const featuredConcert = activeConcerts[0] || concerts[0];

  const totalConcerts = concerts.length;

  const totalCategories =
    categories.length > 1
      ? categories.length - 1
      : 0;

  const totalVenues = new Set(
    concerts
      .map(
        (concert) =>
          concert.venue_address ||
          concert.venues?.address ||
          concert.venues?.name ||
          concert.venue?.name
      )
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-violet-200 selection:text-violet-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative mx-4 mt-24 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 pt-12 text-white shadow-xl shadow-slate-950/10 sm:mx-6 xl:mx-auto xl:max-w-[1360px]">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />

        <div className="absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-sky-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute right-[35%] top-[35%] h-40 w-40 rounded-full bg-slate-400/10 blur-[80px]" />

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">

          {/* =================================================
              HERO GRID
          ================================================= */}

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div>

              {/* Heading */}

              <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-6xl lg:text-[76px]">

                Your next

                <br />

                <span className="bg-gradient-to-r from-slate-100 via-slate-300 to-sky-200 bg-clip-text text-transparent">
                  unforgettable
                </span>

                <br />

                concert.

              </h1>

              {/* Description */}

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">

                Temukan konser favoritmu, pilih tiket
                yang sesuai, dan nikmati pengalaman
                event terbaik bersama{" "}

                <span className="font-black text-sky-300">
                  Concertix.
                </span>

              </p>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="mt-6 flex flex-wrap gap-3">

                

                <Link
                  to="/concerts"
                  className="group rounded-xl bg-sky-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition-all hover:-translate-y-1 hover:bg-sky-600"
                >
                  Semua Konser

                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/orders"
                  className="rounded-xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
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
                    border border-white/10
                    bg-white/[0.07]
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(0,0,0,0.12)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-sky-300/40
                    hover:shadow-[0_18px_45px_rgba(14,165,233,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-sky-500/15
                        text-sky-300
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

                  <p className="mt-4 text-2xl font-black tracking-tight text-white">
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
                    border border-white/10
                    bg-white/[0.07]
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(0,0,0,0.12)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-cyan-300/40
                    hover:shadow-[0_18px_45px_rgba(6,182,212,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-cyan-500/15
                        text-cyan-300
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

                  <p className="mt-4 text-2xl font-black tracking-tight text-white">
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
                    border border-white/10
                    bg-white/[0.07]
                    px-4 py-4
                    shadow-[0_10px_35px_rgba(0,0,0,0.12)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-slate-300/40
                    hover:shadow-[0_18px_45px_rgba(148,163,184,0.10)]
                  "
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-slate-500/15
                        text-slate-300
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

                  <p className="mt-4 text-2xl font-black tracking-tight text-white">
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
                  className="group relative block overflow-hidden rounded-[36px] border border-white bg-white shadow-[0_35px_100px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/60"
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
                    </div>

                    {/* Content */}

                    <div className="absolute bottom-0 left-0 right-0 p-9">

                      <p className="mb-3 text-sm font-bold text-sky-200">
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

                      <div className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition group-hover:bg-slate-100">

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

      {error && !loading && (
        <p
          role="alert"
          className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6 xl:mx-auto xl:max-w-[1360px]"
        >
          {error}
        </p>
      )}

      {/* =====================================================
          EXPLORE
      ===================================================== */}

      <section
        id="explore"
        className="mx-4 my-8 max-w-[1360px] overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/10 sm:mx-6 xl:mx-auto"
      >
        <div className="relative isolate overflow-hidden rounded-[24px] px-6 py-10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-32 -z-10 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Temukan momen berikutnya.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Lihat semua konser, cari berdasarkan artis atau lokasi, dan
                temukan acara yang sesuai jadwalmu.
              </p>
            </div>
            <Link
              to="/concerts"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Lihat semua konser
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {loading && (
            <div className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/[0.07] sm:rounded-2xl"
                >
                  <div className="aspect-square bg-white/10 sm:aspect-[16/9]" />
                  <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && activeConcerts.length > 0 && (
            <div className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {activeConcerts.map((concert) => {
                const venue =
                  concert.venue_address ||
                  concert.venues?.address ||
                  concert.venues?.name;

                return (
                  <Link
                    key={concert.id}
                    to={`/concert/${concert.id}`}
                    className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.07] transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 sm:rounded-2xl"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-800 sm:aspect-[16/9]">
                      {concert.poster ? (
                        <img
                          src={concert.poster}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/50">
                          <Ticket size={30} strokeWidth={1.6} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent sm:from-slate-950/75" />
                      <span className="absolute left-3 top-3 hidden rounded-full border border-white/20 bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur sm:inline-flex">
                        {concert.status === "ongoing"
                          ? "Berlangsung"
                          : "Akan datang"}
                      </span>
                    </div>

                    <div className="p-2 sm:p-4">
                      <span className="mb-1 inline-flex rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-slate-200 sm:hidden">
                        {concert.status === "ongoing"
                          ? "Berlangsung"
                          : "Akan datang"}
                      </span>
                      <h3 className="line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-white sm:min-h-10 sm:text-sm sm:leading-5">
                        {concert.title}
                      </h3>
                      <p className="mt-1 truncate text-[10px] text-slate-300 sm:text-xs">
                        {concert.artist_names ||
                          concert.artists?.name ||
                          "Artis belum diisi"}
                      </p>
                      <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2 text-[10px] text-slate-300 sm:mt-3 sm:space-y-2 sm:pt-3 sm:text-xs">
                        <p className="flex items-center gap-2">
                          <CalendarDays
                            size={14}
                            className="h-3 w-3 shrink-0 text-slate-400 sm:h-3.5 sm:w-3.5"
                          />
                          {formatConcertDate(concert.concert_date)}
                        </p>
                        {venue && (
                          <p className="flex min-w-0 items-center gap-2">
                            <MapPin
                              size={14}
                              className="h-3 w-3 shrink-0 text-slate-400 sm:h-3.5 sm:w-3.5"
                            />
                            <span className="truncate">{venue}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && !error && activeConcerts.length === 0 && (
            <p className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-8 text-center text-sm text-slate-300">
              Belum ada konser aktif saat ini.
            </p>
          )}
        </div>

      </section>

      {/* =====================================================
          WHY CONCERTIX
      ===================================================== */}

      <section
        id="why"
        className="scroll-mt-24 border-y border-slate-200/70 bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Semua kebutuhan konsermu,
              <br />
              dalam satu tempat.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Dari memilih acara hingga tiket siap digunakan, semua terasa
              sederhana dan nyaman.
            </p>

          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-5">

            {/* =================================================
                CARD 1
            ================================================= */}

            <div className="group rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:bg-white hover:shadow-xl hover:shadow-violet-950/5 sm:rounded-2xl sm:p-7">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <Ticket size={21} className="h-4 w-4 sm:h-[21px] sm:w-[21px]" />
              </div>

              <h3 className="mt-3 text-xs font-bold leading-tight text-slate-950 sm:mt-5 sm:text-lg">
                Tiket dalam beberapa langkah
              </h3>

              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Temukan acara, pilih kategori, lalu kelola pesananmu dengan
                mudah.
              </p>

            </div>

            {/* =================================================
                CARD 2
            ================================================= */}

            <div className="group rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 sm:rounded-2xl sm:p-7">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <ShieldCheck size={21} className="h-4 w-4 sm:h-[21px] sm:w-[21px]" />
              </div>

              <h3 className="mt-3 text-xs font-bold leading-tight text-slate-950 sm:mt-5 sm:text-lg">
                Pembayaran tepercaya
              </h3>

              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Pantau status pembayaran dan akses tiket digital dari akunmu.
              </p>

            </div>

            {/* =================================================
                CARD 3
            ================================================= */}

            <div className="group rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-amber-950/5 sm:rounded-2xl sm:p-7">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 transition group-hover:bg-amber-500 group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <Zap size={21} className="h-4 w-4 sm:h-[21px] sm:w-[21px]" />
              </div>

              <h3 className="mt-3 text-xs font-bold leading-tight text-slate-950 sm:mt-5 sm:text-lg">
                Praktis dari awal
              </h3>

              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Informasi konser, pesanan, dan detail tiket tersedia dalam satu
                pengalaman.
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

          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your next concert
            <br />
            starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Jelajahi event yang tersedia dan temukan
            pengalaman musik berikutnya.
          </p>

          <Link
            to="/concerts"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-violet-100"
          >
            Lihat semua konser

            <span className="ml-2">
              →
            </span>

          </Link>

        </div>

      </section>



    </div>
  );
}

export default Home;