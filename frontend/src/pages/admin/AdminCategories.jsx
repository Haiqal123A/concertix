import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
  });

  // =========================
  // GET CATEGORIES
  // =========================

  const getCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data.data || []);
    } catch (err) {
      console.error("GET CATEGORIES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data kategori."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
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
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
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
        name: form.name.trim(),
      };

      if (!payload.name) {
        setError("Nama kategori wajib diisi.");
        return;
      }

      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          payload
        );
      } else {
        await api.post("/categories", payload);
      }

      await getCategories();

      resetForm();
    } catch (err) {
      console.error("SAVE CATEGORY ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan kategori."
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
      "Apakah kamu yakin ingin menghapus kategori ini?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/categories/${id}`);

      await getCategories();
    } catch (err) {
      console.error("DELETE CATEGORY ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menghapus kategori."
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
          Memuat data kategori...
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
              Kelola Kategori
            </h1>

            <p className="text-zinc-400 mt-2">
              Tambah, edit, dan kelola kategori konser Concertix.
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
              : "+ Tambah Kategori"}
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
                  ? "Edit Kategori"
                  : "Tambah Kategori"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Masukkan nama kategori konser.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* NAME */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Nama Kategori
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Pop, Rock, Jazz"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* BUTTON */}

              <div className="flex justify-end gap-3">

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
                    : "Tambah Kategori"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            CATEGORY LIST
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10">

            <h2 className="text-xl font-bold">
              Daftar Kategori
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {categories.length} kategori terdaftar
            </p>

          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-500">
                Belum ada kategori.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      ID
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Nama Kategori
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500 text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {categories.map((category) => (

                    <tr
                      key={category.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >

                      {/* ID */}

                      <td className="px-6 py-5 text-zinc-500">
                        #{category.id}
                      </td>

                      {/* NAME */}

                      <td className="px-6 py-5">

                        <p className="font-semibold">
                          {category.name}
                        </p>

                        <p className="text-sm text-zinc-500 mt-1">
                          Kategori konser
                        </p>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(category)
                            }
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(category.id)
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

export default AdminCategories;