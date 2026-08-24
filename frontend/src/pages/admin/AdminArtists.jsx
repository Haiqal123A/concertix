import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminArtists() {
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    image: "",
    description: "",
  });

  // =========================
  // GET ARTISTS
  // =========================

  const getArtists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/artists");

      setArtists(response.data.data || []);
    } catch (err) {
      console.error("GET ARTISTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data artist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArtists();
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
      name: "",
      image: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (artist) => {
    setEditingId(artist.id);

    setForm({
      name: artist.name || "",
      image: artist.image || "",
      description: artist.description || "",
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
        name: form.name,
        image: form.image,
        description: form.description,
      };

      if (editingId) {
        await api.put(`/artists/${editingId}`, payload);
      } else {
        await api.post("/artists", payload);
      }

      await getArtists();

      resetForm();
    } catch (err) {
      console.error("SAVE ARTIST ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan artist."
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
      "Apakah kamu yakin ingin menghapus artist ini?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/artists/${id}`);

      await getArtists();
    } catch (err) {
      console.error("DELETE ARTIST ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menghapus artist."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Memuat data artist...
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
              Kelola Artist
            </h1>

            <p className="text-zinc-400 mt-2">
              Tambah, edit, dan kelola artist Concertix.
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
            {showForm ? "Tutup Form" : "+ Tambah Artist"}
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
                  ? "Edit Artist"
                  : "Tambah Artist"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Lengkapi informasi artist di bawah.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* NAME */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Nama Artist
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Bruno Mars"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* IMAGE */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  URL Foto Artist
                </label>

                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />

                {form.image && (
                  <div className="mt-4">
                    <p className="text-xs text-zinc-500 mb-2">
                      Preview
                    </p>

                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-24 h-24 rounded-xl object-cover border border-white/10"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
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
                  placeholder="Deskripsi artist..."
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
                    : "Tambah Artist"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            ARTIST LIST
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10">

            <h2 className="text-xl font-bold">
              Daftar Artist
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {artists.length} artist terdaftar
            </p>

          </div>

          {artists.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-500">
                Belum ada artist.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Artist
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Deskripsi
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500 text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {artists.map((artist) => (

                    <tr
                      key={artist.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >

                      {/* ARTIST */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          {artist.image ? (
                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="w-16 h-16 rounded-xl object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-xs text-zinc-600">
                              No Image
                            </div>
                          )}

                          <div>

                            <p className="font-semibold">
                              {artist.name}
                            </p>

                            <p className="text-sm text-zinc-500 mt-1">
                              Artist #{artist.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}

                      <td className="px-6 py-5 max-w-xl">

                        <p className="text-zinc-400 text-sm line-clamp-2">
                          {artist.description ||
                            "Tidak ada deskripsi."}
                        </p>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(artist)
                            }
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(artist.id)
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

export default AdminArtists;