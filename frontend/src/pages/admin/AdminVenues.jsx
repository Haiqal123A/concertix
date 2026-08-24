import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminVenues() {
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    image: "",
  });

  // =========================
  // GET DATA
  // =========================

  const getVenues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/venues");

      setVenues(response.data.data || []);
    } catch (err) {
      console.error("GET VENUES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data venue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVenues();
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
  // RESET
  // =========================

  const resetForm = () => {
    setForm({
      name: "",
      city: "",
      address: "",
      image: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (venue) => {
    setEditingId(venue.id);

    setForm({
      name: venue.name || "",
      city: venue.city || "",
      address: venue.address || "",
      image: venue.image || "",
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
        city: form.city,
        address: form.address,
        image: form.image || null,
      };

      if (editingId) {
        await api.put(`/venues/${editingId}`, payload);
      } else {
        await api.post("/venues", payload);
      }

      await getVenues();

      resetForm();
    } catch (err) {
      console.error("SAVE VENUE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan venue."
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
      "Apakah kamu yakin ingin menghapus venue ini?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/venues/${id}`);

      await getVenues();
    } catch (err) {
      console.error("DELETE VENUE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menghapus venue."
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
          Memuat data venue...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-sm tracking-[0.3em] text-purple-400 mb-3">
              ADMIN PANEL
            </p>

            <h1 className="text-4xl font-bold">
              Kelola Venue
            </h1>

            <p className="text-zinc-400 mt-2">
              Tambah, edit, dan kelola venue Concertix.
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
            {showForm ? "Tutup Form" : "+ Tambah Venue"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* FORM */}

        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 mb-8">

            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Venue" : "Tambah Venue"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Lengkapi informasi venue di bawah.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* NAMA */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Nama Venue
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Gelora Bung Karno"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* KOTA */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Kota
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* ALAMAT */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Alamat
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Alamat lengkap venue..."
                  rows="4"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* IMAGE */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  URL Gambar Venue
                </label>

                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
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
                    : "Tambah Venue"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* LIST */}

        <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-bold">
              Daftar Venue
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {venues.length} venue terdaftar
            </p>
          </div>

          {venues.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-500">
                Belum ada venue.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Venue
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Kota
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Alamat
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {venues.map((venue) => (
                    <tr
                      key={venue.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >

                      {/* VENUE */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">

                          {venue.image ? (
                            <img
                              src={venue.image}
                              alt={venue.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xs text-zinc-600">
                              No Image
                            </div>
                          )}

                          <div>
                            <p className="font-semibold">
                              {venue.name}
                            </p>

                            <p className="text-sm text-zinc-500 mt-1">
                              Venue #{venue.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* KOTA */}

                      <td className="px-6 py-5 text-zinc-300">
                        {venue.city || "-"}
                      </td>

                      {/* ALAMAT */}

                      <td className="px-6 py-5">
                        <p className="text-zinc-300 max-w-md">
                          {venue.address || "-"}
                        </p>
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => handleEdit(venue)}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(venue.id)}
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

export default AdminVenues;