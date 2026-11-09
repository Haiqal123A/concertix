import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminConcerts() {
  const [concerts, setConcerts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category_id: "",
    artist_id: "",
    venue_id: "",
    title: "",
    poster: "",
    description: "",
    concert_date: "",
    concert_time: "",
    status: "upcoming",
  });

  // =========================
  // GET DATA
  // =========================

  const getData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        concertResponse,
        artistResponse,
        categoryResponse,
        venueResponse,
      ] = await Promise.all([
        api.get("/concerts"),
        api.get("/artists"),
        api.get("/categories"),
        api.get("/venues"),
      ]);

      setConcerts(concertResponse.data.data || []);
      setArtists(artistResponse.data.data || []);
      setCategories(categoryResponse.data.data || []);
      setVenues(venueResponse.data.data || []);
    } catch (err) {
      console.error("ADMIN CONCERT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data konser."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      category_id: "",
      artist_id: "",
      venue_id: "",
      title: "",
      poster: "",
      description: "",
      concert_date: "",
      concert_time: "",
      status: "upcoming",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (concert) => {
    setEditingId(concert.id);

    setForm({
      category_id: concert.category_id || "",
      artist_id: concert.artist_id || "",
      venue_id: concert.venue_id || "",
      title: concert.title || "",
      poster: concert.poster || "",
      description: concert.description || "",
      concert_date: concert.concert_date || "",
      concert_time: concert.concert_time || "",
      status: concert.status || "upcoming",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        category_id: Number(form.category_id),
        artist_id: Number(form.artist_id),
        venue_id: Number(form.venue_id),
        title: form.title,
        poster: form.poster,
        description: form.description,
        concert_date: form.concert_date,
        concert_time: form.concert_time,
        status: form.status,
      };

      if (editingId) {
        await api.put(`/concerts/${editingId}`, payload);
      } else {
        await api.post("/concerts", payload);
      }

      await getData();

      resetForm();
    } catch (err) {
      console.error("SAVE CONCERT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan konser."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus konser ini?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/concerts/${id}`);

      await getData();
    } catch (err) {
      console.error("DELETE CONCERT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menghapus konser."
      );
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // STATUS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "ongoing":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "finished":
        return "bg-neutral-100 text-neutral-600 border-neutral-200";

      case "cancelled":
        return "bg-red-50 text-red-600 border-red-200";

      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="text-sm font-medium text-neutral-500">
            Memuat data konser...
          </p>
        </div>
      </div>
    );
  }

  return (
<div className="relative overflow-hidden bg-white px-6 py-8 sm:px-8">
      {/* =========================
          BACKGROUND GLOW
      ========================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="absolute left-1/2 top-[600px] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-100/30 blur-3xl" />
      </div>

<main className="relative mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8">
       <div className="mb-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
  <div>
    <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
      Kelola Konser
    </h1>

    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
      Tambah, edit, dan kelola konser Concertix dengan mudah.
    </p>
  </div>

  <button
    onClick={() => {
      if (showForm) {
        resetForm();
      } else {
        setShowForm(true);
      }
    }}
    className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 hover:shadow-violet-300"
  >
    {showForm ? "Tutup Form" : "+ Tambah Konser"}
  </button>
</div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            <span className="mt-0.5">!</span>

            <p>{error}</p>
          </div>
        )}

        {/* =========================
            FORM
        ========================= */}

        {showForm && (
          <div className="mb-10 rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl shadow-neutral-200/50 sm:p-7">

            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Concert Management
                </p>

                <h2 className="mt-2 text-xl font-black text-neutral-900">
                  {editingId
                    ? "Edit Konser"
                    : "Tambah Konser"}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Lengkapi informasi konser di bawah.
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600 sm:flex">
                ✦
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >

              {/* TITLE */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Judul Konser
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Concertix Music Festival"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>

              {/* ARTIST */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Artist
                </label>

                <select
                  name="artist_id"
                  value={form.artist_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                >
                  <option value="">
                    Pilih Artist
                  </option>

                  {artists.map((artist) => (
                    <option
                      key={artist.id}
                      value={artist.id}
                    >
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Category
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                >
                  <option value="">
                    Pilih Category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* VENUE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Venue
                </label>

                <select
                  name="venue_id"
                  value={form.venue_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                >
                  <option value="">
                    Pilih Venue
                  </option>

                  {venues.map((venue) => (
                    <option
                      key={venue.id}
                      value={venue.id}
                    >
                      {venue.name} - {venue.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                >
                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="ongoing">
                    Ongoing
                  </option>

                  <option value="finished">
                    Finished
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Tanggal Konser
                </label>

                <input
                  type="date"
                  name="concert_date"
                  value={form.concert_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>

              {/* TIME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Waktu Konser
                </label>

                <input
                  type="time"
                  name="concert_time"
                  value={form.concert_time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>

              {/* POSTER */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  URL Poster
                </label>

                <input
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Deskripsi konser..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />
              </div>

              {/* BUTTON */}

              <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Konser"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================
            CONCERT LIST
        ========================= */}

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/40">

          {/* LIST HEADER */}

          <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div>
              <h2 className="text-xl font-black text-neutral-900">
                Daftar Konser
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {concerts.length} konser terdaftar
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              Concertix
            </div>
          </div>

          {concerts.length === 0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-500">
                ♪
              </div>

              <h3 className="mt-5 font-bold text-neutral-800">
                Belum ada konser
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Tambahkan konser pertama untuk mulai menjual tiket.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                + Tambah Konser
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead className="border-b border-neutral-100 bg-neutral-50/70">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Konser
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Artist
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Venue
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {concerts.map((concert) => (
                    <tr
                      key={concert.id}
                      className="border-b border-neutral-100 transition last:border-0 hover:bg-violet-50/30"
                    >

                      {/* CONCERT */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">

                          {concert.poster ? (
                            <img
                              src={concert.poster}
                              alt={concert.title}
                              className="h-20 w-16 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-20 w-16 items-center justify-center rounded-xl bg-violet-50 text-xs font-medium text-violet-400">
                              No Image
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate font-bold text-neutral-900">
                              {concert.title}
                            </p>

                            <p className="mt-1 text-sm text-neutral-400">
                              {concert.categories?.name || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ARTIST */}

                      <td className="px-6 py-5 text-sm font-medium text-neutral-600">
                        {concert.artists?.name || "-"}
                      </td>

                      {/* VENUE */}

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-neutral-700">
                          {concert.venues?.name || "-"}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {concert.venues?.city || "-"}
                        </p>
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-neutral-700">
                          {formatDate(concert.concert_date)}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {concert.concert_time || "-"}
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                            concert.status
                          )}`}
                        >
                          {concert.status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(concert)
                            }
                            className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(concert.id)
                            }
                            className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                          >
                            Hapus
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================
            BOTTOM INFO
        ========================= */}

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-800">
              Concertix Admin
            </p>

            <p className="text-xs text-neutral-500">
              Kelola seluruh konser dari satu tempat.
            </p>
          </div>

          <span className="text-xs font-semibold text-violet-600">
            {concerts.length} Concert
            {concerts.length !== 1 ? "s" : ""}
          </span>
        </div>

      </main>
    </div>
  );
}

export default AdminConcerts;