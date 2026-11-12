import { useEffect, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { useConfirmation } from "../../components/useConfirmation";
import api from "../../services/api";

const POSTER_MAX_SIZE = 4 * 1024 * 1024;
const POSTER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const getArtistNames = (value = "") =>
  value
    .split(/[,\n;]+/)
    .map((name) => name.trim())
    .filter(Boolean);

function AdminConcerts() {
  const confirm = useConfirmation();
  const [concerts, setConcerts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    artist_names: "",
    venue_address: "",
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

      const [concertResponse, categoryResponse] = await Promise.all([
        api.get("/concerts"),
        api.get("/categories"),
      ]);

      setConcerts(concertResponse.data.data || []);
      setCategories(categoryResponse.data.data || []);
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
    let active = true;

    Promise.all([api.get("/concerts"), api.get("/categories")])
      .then(([concertResponse, categoryResponse]) => {
        if (!active) return;
        setError("");
        setConcerts(concertResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("ADMIN CONCERT ERROR:", err);
        setError(
          err.response?.data?.message || "Gagal mengambil data konser."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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

  const handlePosterSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setPosterFile(null);
    setPosterPreview(form.poster || "");

    if (!POSTER_TYPES.includes(file.type)) {
      setError("Pilih poster berformat JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > POSTER_MAX_SIZE) {
      setError("Ukuran poster maksimal 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Gagal membaca file poster.");
        return;
      }

      setError("");
      setPosterFile(file);
      setPosterPreview(reader.result);
    };
    reader.onerror = () => {
      setError("Gagal membaca file poster.");
    };
    reader.readAsDataURL(file);
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      category_id: "",
      artist_names: "",
      venue_address: "",
      title: "",
      poster: "",
      description: "",
      concert_date: "",
      concert_time: "",
      status: "upcoming",
    });

    setPosterFile(null);
    setPosterPreview("");
    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (concert) => {
    setEditingId(concert.id);
    setPosterFile(null);
    setPosterPreview(concert.poster || "");

    setForm({
      category_id: concert.category_id || "",
      artist_names:
        concert.artist_names || concert.artists?.name || "",
      venue_address:
        concert.venue_address ||
        concert.venues?.address ||
        concert.venues?.name ||
        "",
      title: concert.title || "",
      poster: concert.poster || "",
      description: concert.description || "",
      concert_date: concert.concert_date || "",
      concert_time: concert.concert_time || "",
      status:
        concert.configured_status === "cancelled" ? "cancelled" : "upcoming",
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
        artist_names: form.artist_names.trim(),
        venue_address: form.venue_address.trim(),
        title: form.title,
        poster: form.poster,
        description: form.description,
        concert_date: form.concert_date,
        concert_time: form.concert_time,
        status: form.status,
      };

      if (posterFile) {
        const uploadForm = new FormData();
        uploadForm.append("poster", posterFile);
        const uploadResponse = await api.post(
          "/concerts/poster",
          uploadForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const posterUrl = uploadResponse.data.data.url;
        payload.poster = posterUrl;
        setForm((current) => ({ ...current, poster: posterUrl }));
        setPosterFile(null);
        setPosterPreview(posterUrl);
      }

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
    const confirmed = await confirm({
      title: "Hapus konser?",
      message: "Konser ini akan dihapus dan tidak dapat dipulihkan.",
      confirmLabel: "Hapus konser",
    });

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

      case "sold_out":
        return "bg-amber-50 text-amber-700 border-amber-200";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
      <main className="mx-auto max-w-7xl pb-12">
        <header className="mb-7 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Kelola Konser
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Atur informasi, poster, dan jadwal acara.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            {showForm ? "Tutup Form" : "+ Tambah Konser"}
          </button>
        </header>

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
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {editingId
                    ? "Edit Konser"
                    : "Tambah Konser"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi detail acara dan unggah posternya.
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 sm:flex">
                <ImagePlus size={20} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >

              {/* TITLE */}

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Judul Konser
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Concertix Music Festival"
                  required
                  className={fieldClass}
                />
              </div>

              {/* ARTISTS */}

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Artis
                </label>

                <textarea
                  name="artist_names"
                  value={form.artist_names}
                  onChange={handleChange}
                  required
                  rows={2}
                  maxLength={1000}
                  placeholder="Tulis nama artis, pisahkan dengan koma atau baris baru"
                  className={`${fieldClass} resize-y`}
                />
                <p className="mt-2 text-xs text-neutral-500">
                  {getArtistNames(form.artist_names).length} artis
                </p>
              </div>

              {/* CATEGORY */}

              <div>
                <label className={labelClass}>
                  Kategori
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  <option value="">
                    Pilih Kategori
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

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Alamat Venue
                </label>

                <input
                  type="text"
                  name="venue_address"
                  value={form.venue_address}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  placeholder="Tulis alamat lengkap venue"
                  className={fieldClass}
                />
              </div>

              {/* STATUS */}

              <div>
                <label className={labelClass}>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  <option value="upcoming">
                    Otomatis berdasarkan tanggal & tiket
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              {/* DATE */}

              <div>
                <label className={labelClass}>
                  Tanggal Konser
                </label>

                <input
                  type="date"
                  name="concert_date"
                  value={form.concert_date}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>

              {/* TIME */}

              <div>
                <label className={labelClass}>
                  Waktu Konser
                </label>

                <input
                  type="time"
                  name="concert_time"
                  value={form.concert_time}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                />
              </div>

              {/* POSTER */}

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Poster Konser
                </label>

                <div className="grid gap-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:grid-cols-[160px_1fr] sm:items-center sm:p-5">
                  <div className="flex aspect-[4/5] max-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:max-h-48">
                    {posterPreview ? (
                      <img
                        src={posterPreview}
                        alt="Pratinjau poster konser"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ImagePlus size={28} strokeWidth={1.5} />
                        <span className="text-xs font-medium">
                          Pratinjau poster
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800">
                      <Upload size={16} />
                      Pilih file poster
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePosterSelect}
                        className="sr-only"
                      />
                    </label>

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      {posterFile?.name || "JPG, PNG, atau WebP · maksimal 4 MB"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Ukuran rekomendasi 1200 × 1500 px (rasio 4:5). Poster
                      akan menyesuaikan layar dan dipotong agar tetap rapi.
                    </p>

                    {posterPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreview("");
                          setForm((current) => ({ ...current, poster: "" }));
                        }}
                        className="mt-3 text-sm font-semibold text-red-600 transition hover:text-red-700"
                      >
                        Hapus poster
                      </button>
                    )}
                  </div>
                </div>
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
                  className={`${fieldClass} resize-none leading-6`}
                />
              </div>

              {/* BUTTON */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* LIST HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Daftar Konser
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {concerts.length} konser terdaftar
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {concerts.length} konser
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

                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Konser
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Artis
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Alamat Venue
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {concerts.map((concert) => (
                    <tr
                      key={concert.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
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
                            <p className="max-w-[230px] truncate font-semibold text-slate-900">
                              {concert.title}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {concert.categories?.name || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ARTIST */}

                      <td className="max-w-[220px] px-6 py-5 text-sm font-medium text-slate-700">
                        <p className="break-words">
                          {concert.artist_names || concert.artists?.name || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {concert.artist_count ??
                            getArtistNames(
                              concert.artist_names ||
                                concert.artists?.name ||
                                ""
                            ).length}{" "}
                          artis
                        </p>
                      </td>

                      {/* VENUE */}

                      <td className="px-6 py-5">
                        <p className="max-w-[240px] break-words text-sm font-medium text-slate-700">
                          {concert.venue_address ||
                            concert.venues?.address ||
                            concert.venues?.name ||
                            "-"}
                        </p>

                        {concert.venues?.city && !concert.venue_address && (
                          <p className="mt-1 text-xs text-slate-500">
                            {concert.venues.city}
                          </p>
                        )}
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(concert.concert_date)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
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
                          {{
                            upcoming: "Upcoming",
                            ongoing: "Ongoing",
                            sold_out: "Sold Out",
                            finished: "Finished",
                            cancelled: "Cancelled",
                          }[concert.status] || concert.status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(concert)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(concert.id)
                            }
                            className="rounded-lg border border-red-100 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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