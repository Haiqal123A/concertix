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
  // STATUS BADGE
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "ongoing":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "finished":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Memuat data konser...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

          <div>
            <p className="text-sm tracking-[0.3em] text-purple-400 mb-3">
              ADMIN PANEL
            </p>

            <h1 className="text-4xl font-bold">
              Kelola Konser
            </h1>

            <p className="text-zinc-400 mt-2">
              Tambah, edit, dan kelola konser Concertix.
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
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-700 transition"
          >
            {showForm
              ? "Tutup Form"
              : "+ Tambah Konser"}
          </button>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            FORM
        ========================= */}

        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 mb-8">

            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Edit Konser"
                  : "Tambah Konser"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Lengkapi informasi konser di bawah.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* TITLE */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Judul Konser
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Concertix Music Festival"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* ARTIST */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Artist
                </label>

                <select
                  name="artist_id"
                  value={form.artist_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
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
                <label className="block text-sm text-zinc-400 mb-2">
                  Category
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
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
                <label className="block text-sm text-zinc-400 mb-2">
                  Venue
                </label>

                <select
                  name="venue_id"
                  value={form.venue_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
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
                <label className="block text-sm text-zinc-400 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
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
                <label className="block text-sm text-zinc-400 mb-2">
                  Tanggal Konser
                </label>

                <input
                  type="date"
                  name="concert_date"
                  value={form.concert_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* TIME */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Waktu Konser
                </label>

                <input
                  type="time"
                  name="concert_time"
                  value={form.concert_time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* POSTER */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  URL Poster
                </label>

                <input
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Deskripsi konser..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* BUTTON */}

              <div className="md:col-span-2 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-zinc-300 hover:bg-white/5 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700 transition disabled:opacity-50"
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

        <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10">

            <h2 className="text-xl font-bold">
              Daftar Konser
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {concerts.length} konser terdaftar
            </p>

          </div>

          {concerts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-500">
                Belum ada konser.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>
                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Konser
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Artist
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Venue
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500 text-right">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {concerts.map((concert) => (

                    <tr
                      key={concert.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >

                      {/* CONCERT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          {concert.poster ? (
                            <img
                              src={concert.poster}
                              alt={concert.title}
                              className="w-16 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-20 rounded-lg bg-white/5 flex items-center justify-center text-xs text-zinc-600">
                              No Image
                            </div>
                          )}

                          <div>

                            <p className="font-semibold">
                              {concert.title}
                            </p>

                            <p className="text-sm text-zinc-500 mt-1">
                              {concert.categories?.name ||
                                "-"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ARTIST */}

                      <td className="px-6 py-5 text-zinc-300">
                        {concert.artists?.name || "-"}
                      </td>

                      {/* VENUE */}

                      <td className="px-6 py-5">

                        <p className="text-zinc-300">
                          {concert.venues?.name || "-"}
                        </p>

                        <p className="text-sm text-zinc-500">
                          {concert.venues?.city || "-"}
                        </p>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5">

                        <p className="text-zinc-300">
                          {formatDate(
                            concert.concert_date
                          )}
                        </p>

                        <p className="text-sm text-zinc-500">
                          {concert.concert_time || "-"}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
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
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(concert.id)
                            }
                            className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
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

      </main>
    </div>
  );
}

export default AdminConcerts;