import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import api from "../services/api";

const getJakartaDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const formatDate = (date) => {
  if (!date) return "Tanggal belum tersedia";
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Tanggal belum tersedia";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const statusLabels = {
  upcoming: "Akan datang",
  ongoing: "Sedang berlangsung",
  sold_out: "Tiket habis",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

function ConcertCard({ concert, isFinished }) {
  const category =
    concert.categories?.name ||
    concert.category?.name ||
    concert.category_name;
  const artist =
    concert.artist_names ||
    concert.artists?.name ||
    concert.artist?.name ||
    concert.artist_name;
  const venue = concert.venues || concert.venue || {};
  const venueAddress = concert.venue_address || venue.address;
  const venueLabel =
    venueAddress || [venue.name, venue.city].filter(Boolean).join(", ");
  const status = isFinished ? "finished" : concert.status;

  return (
    <Link
      to={`/concert/${concert.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_22px_55px_rgba(76,29,149,0.12)]"
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-violet-100 via-slate-100 to-fuchsia-100 sm:h-64">
        {concert.poster && (
          <img
            src={concert.poster}
            alt={concert.title}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
              isFinished ? "grayscale-[35%]" : ""
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
        <span className="absolute left-2 top-2 rounded-full border border-white/30 bg-slate-950/45 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px]">
          {statusLabels[status] || "Akan datang"}
        </span>
        {category && (
          <span className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-xs">
            {category}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-5">
        <p className="flex items-center gap-1 text-[10px] font-semibold text-violet-700 sm:gap-1.5 sm:text-xs">
          <CalendarDays size={14} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          {formatDate(concert.concert_date)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-950 sm:mt-2 sm:text-lg">
          {concert.title}
        </h3>
        {artist && (
          <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
            {artist}
            {concert.artist_count > 0 && ` · ${concert.artist_count} artis`}
          </p>
        )}

        <div className="mt-3 space-y-1.5 text-xs text-slate-500 sm:mt-4 sm:space-y-2 sm:text-sm">
          {concert.concert_time && (
            <p className="flex items-center gap-2">
              <Clock3 size={15} className="h-3 w-3 shrink-0 text-slate-400 sm:h-[15px] sm:w-[15px]" />
              {concert.concert_time}
            </p>
          )}
          {venueLabel && (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="h-3 w-3 shrink-0 text-slate-400 sm:h-[15px] sm:w-[15px]" />
              <span className="truncate">{venueLabel}</span>
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">
            Lihat detail
          </span>
          <ArrowUpRight
            size={18}
            className="h-4 w-4 text-violet-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-[18px] sm:w-[18px]"
          />
        </div>
      </div>
    </Link>
  );
}

function ConcertSection({ title, concerts, finished = false }) {
  if (concerts.length === 0) return null;

  return (
    <section className={finished ? "mt-16 border-t border-slate-200 pt-10" : ""}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
            {finished ? "Arsip acara" : ""}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
          {concerts.length} acara
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 min-[430px]:grid-cols-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {concerts.map((concert) => (
          <ConcertCard
            key={concert.id}
            concert={concert}
            isFinished={finished}
          />
        ))}
      </div>
    </section>
  );
}

function AllConcerts() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const fetchConcerts = async () => {
      try {
        const response = await api.get("/concerts");
        if (active) setConcerts(response.data.data || []);
      } catch (err) {
        console.error("GET CONCERTS ERROR:", err);
        if (active) {
          setError(
            err.response?.data?.message || "Gagal mengambil data konser."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchConcerts();
    return () => {
      active = false;
    };
  }, []);

  const { upcomingConcerts, finishedConcerts, resultCount } = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");
    const today = getJakartaDate();
    const matchingConcerts = concerts.filter((concert) => {
      const venue = concert.venues || concert.venue;
      const searchableText = [
        concert.title,
        concert.artists?.name,
        concert.artist?.name,
        concert.artist_name,
        concert.artist_names,
        concert.categories?.name,
        concert.category?.name,
        concert.category_name,
        concert.venue_address,
        venue?.name,
        venue?.city,
        venue?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return searchableText.includes(keyword);
    });

    const upcoming = [];
    const finished = [];
    matchingConcerts.forEach((concert) => {
      if (
        concert.status === "finished" ||
        (concert.concert_date && concert.concert_date < today)
      ) {
        finished.push(concert);
      } else {
        upcoming.push(concert);
      }
    });

    const byDateAscending = (a, b) =>
      String(a.concert_date || "").localeCompare(String(b.concert_date || ""));
    upcoming.sort(byDateAscending);
    finished.sort((a, b) => byDateAscending(b, a));

    return {
      upcomingConcerts: upcoming,
      finishedConcerts: finished,
      resultCount: matchingConcerts.length,
    };
  }, [concerts, search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50/70 via-slate-50 to-fuchsia-50/60 pb-20 pt-28 text-slate-900 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-7 lg:p-9">
          <header className="relative isolate overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-5 py-7 text-white sm:px-7 sm:py-8">
            <div className="pointer-events-none absolute -right-12 -top-28 -z-10 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Semua Konser
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Temukan acara berdasarkan jadwalnya. Konser terdekat tampil
                  lebih dulu, sementara acara yang sudah selesai ada di bagian
                  bawah.
                </p>
              </div>
              <div className="relative w-full md:max-w-sm">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari konser, artis, atau lokasi"
                  aria-label="Cari konser, artis, atau lokasi"
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </header>

          {!loading && !error && (
            <div className="mt-7 flex items-center gap-2 text-sm text-slate-500">
              <Ticket size={16} className="text-violet-700" />
              <span>{resultCount} konser ditemukan</span>
            </div>
          )}

          {loading && (
            <div className="mt-8 grid grid-cols-2 gap-3 min-[430px]:grid-cols-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="h-36 bg-slate-200 sm:h-64" />
                  <div className="space-y-3 p-3 sm:p-5">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
            >
              <p className="font-semibold">Konser belum dapat dimuat</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && resultCount === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Search size={24} />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Konser tidak ditemukan
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Coba kata kunci lain untuk menemukan acara yang kamu cari.
              </p>
            </div>
          )}

          {!loading && !error && resultCount > 0 && (
            <>
              <ConcertSection
                title="Akan datang"
                concerts={upcomingConcerts}
              />
              <ConcertSection
                title="Sudah berlangsung"
                concerts={finishedConcerts}
                finished
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default AllConcerts;
