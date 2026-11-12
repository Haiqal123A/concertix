import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useConfirmation } from "../../components/useConfirmation";
import api from "../../services/api";

const getRemainingStock = (ticket) =>
  Math.max(0, Number(ticket.stock || 0) - Number(ticket.sold || 0));

const isTicketSoldOut = (ticket) => getRemainingStock(ticket) === 0;

const fetchTicketPageData = async () => {
  const [ticketResponse, concertResponse] = await Promise.all([
    api.get("/ticket-types"),
    api.get("/concerts"),
  ]);

  return {
    ticketTypes: ticketResponse.data.data || [],
    concerts: concertResponse.data.data || [],
  };
};

function AdminTicketTypes() {
  const confirm = useConfirmation();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [concerts, setConcerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    concert_id: "",
    name: "",
    price: "",
    stock: "",
  });

  // =========================
  // GET DATA
  // =========================

  const getData = async () => {
    try {
      const data = await fetchTicketPageData();
      setTicketTypes(data.ticketTypes);
      setConcerts(data.concerts);
    } catch (err) {
      console.error("ADMIN TICKET TYPE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchTicketPageData()
      .then((data) => {
        if (!active) return;

        setTicketTypes(data.ticketTypes);
        setConcerts(data.concerts);
      })
      .catch((err) => {
        if (!active) return;

        console.error("ADMIN TICKET TYPE ERROR:", err);
        setError(
          err.response?.data?.message || "Gagal mengambil data ticket."
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
  // HANDLE CHANGE
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
      concert_id: "",
      name: "",
      price: "",
      stock: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (ticket) => {
    setEditingId(ticket.id);

    setForm({
      concert_id: ticket.concert_id || "",
      name: ticket.name || "",
      price: ticket.price || "",
      stock: ticket.stock || "",
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
        concert_id: Number(form.concert_id),
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId) {
        await api.put(
          `/ticket-types/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/ticket-types",
          payload
        );
      }

      await getData();

      resetForm();
    } catch (err) {
      console.error("SAVE TICKET TYPE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan ticket."
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
      title: "Hapus jenis tiket?",
      message: "Jenis tiket ini akan dihapus dan tidak dapat dipulihkan.",
      confirmLabel: "Hapus jenis tiket",
    });

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/ticket-types/${id}`);

      await getData();
    } catch (err) {
      console.error(
        "DELETE TICKET TYPE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Gagal menghapus ticket."
      );
    }
  };

  // =========================
  // FORMAT RUPIAH
  // =========================

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString(
      "id-ID"
    )}`;
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const filteredTicketTypes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");

    return [...ticketTypes]
      .sort(
        (first, second) =>
          Number(isTicketSoldOut(first)) - Number(isTicketSoldOut(second))
      )
      .filter((ticket) => {
        if (!query) return true;

        return [
          ticket.name,
          ticket.concerts?.title,
          String(ticket.id || ""),
        ].some((value) =>
          String(value || "").toLocaleLowerCase("id-ID").includes(query)
        );
      });
  }, [search, ticketTypes]);

  const totalStock = ticketTypes.reduce(
    (total, ticket) => total + Number(ticket.stock || 0),
    0
  );
  const totalSold = ticketTypes.reduce(
    (total, ticket) => total + Number(ticket.sold || 0),
    0
  );
  const soldOutCount = ticketTypes.filter(isTicketSoldOut).length;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="text-sm font-medium text-slate-500">
            Memuat jenis tiket...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Jenis tiket
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Atur harga dan ketersediaan tiket untuk setiap konser.
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
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Tutup formulir" : "Tambah jenis tiket"}
          </button>
        </header>

        <section
          aria-label="Ringkasan tiket"
          className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              label: "Jenis tiket",
              value: ticketTypes.length,
              icon: Ticket,
              iconStyle: "bg-violet-50 text-violet-700",
            },
            {
              label: "Total stok",
              value: totalStock,
              icon: PackageCheck,
              iconStyle: "bg-sky-50 text-sky-700",
            },
            {
              label: "Tiket terjual",
              value: totalSold,
              icon: BadgeCheck,
              iconStyle: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Tiket habis",
              value: soldOutCount,
              icon: PackageX,
              iconStyle: "bg-amber-50 text-amber-700",
            },
          ].map(({ label, value, icon: Icon, iconStyle }) => (
            <article
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {value.toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
              >
                <Icon size={19} />
              </span>
            </article>
          ))}
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                getData();
              }}
              className="shrink-0 font-semibold text-rose-800 hover:underline"
            >
              Muat ulang
            </button>
          </div>
        )}

        {showForm && (
          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                {editingId ? "Perbarui tiket" : ""}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {editingId ? "Edit jenis tiket" : "Tambah jenis tiket"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lengkapi detail tiket dan stok yang tersedia.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label
                  htmlFor="ticket-concert"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konser
                </label>
                <select
                  id="ticket-concert"
                  name="concert_id"
                  value={form.concert_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Pilih konser</option>
                  {concerts.map((concert) => (
                    <option key={concert.id} value={concert.id}>
                      {concert.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ticket-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama tiket
                </label>
                <input
                  id="ticket-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: VIP, Regular, VVIP"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="ticket-price"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Harga
                </label>
                <input
                  id="ticket-price"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Contoh: 250000"
                  min="0"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="ticket-stock"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Total stok
                </label>
                <input
                  id="ticket-stock"
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Contoh: 500"
                  min="0"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {editingId && (
                <div>
                  <label
                    htmlFor="ticket-sold"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tiket terjual
                  </label>
                  <input
                    id="ticket-sold"
                    type="text"
                    value={
                      ticketTypes.find((ticket) => ticket.id === editingId)
                        ?.sold || 0
                    }
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan perubahan"
                      : "Tambah tiket"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Daftar jenis tiket
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredTicketTypes.length.toLocaleString("id-ID")} dari{" "}
                {ticketTypes.length.toLocaleString("id-ID")} jenis tiket
                ditampilkan. Tiket habis berada di bagian bawah.
              </p>
            </div>

            <label className="relative block w-full sm:max-w-xs">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari tiket atau konser..."
                aria-label="Cari jenis tiket atau konser"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          {filteredTicketTypes.length === 0 ? (
            <div className="px-5 py-14 text-center sm:py-16">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Ticket size={21} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                {ticketTypes.length === 0
                  ? "Belum ada jenis tiket"
                  : "Tiket tidak ditemukan"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {ticketTypes.length === 0
                  ? "Tambahkan jenis tiket untuk mulai mengatur stok dan harga."
                  : "Coba kata kunci nama tiket atau nama konser yang lain."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTicketTypes.map((ticket) => {
                const soldOut = isTicketSoldOut(ticket);
                const remaining = getRemainingStock(ticket);

                return (
                  <article
                    key={ticket.id}
                    className={`grid gap-4 p-4 transition hover:bg-slate-50/70 sm:grid-cols-12 sm:items-center sm:gap-3 sm:px-5 ${
                      soldOut ? "bg-slate-50/60" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:col-span-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          soldOut
                            ? "bg-slate-200 text-slate-500"
                            : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        <Ticket size={19} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {ticket.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              soldOut
                                ? "bg-slate-200 text-slate-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {soldOut ? "Habis" : "Tersedia"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {ticket.concerts?.title || "Konser tidak ditemukan"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <CalendarDays size={12} />
                          {ticket.concerts?.concert_date
                            ? formatDate(ticket.concerts.concert_date)
                            : `ID #${ticket.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:col-span-5">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Harga
                        </p>
                        <p className="mt-1 text-sm font-semibold text-violet-700">
                          {formatRupiah(ticket.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Sisa stok
                        </p>
                        <p
                          className={`mt-1 text-sm font-semibold ${
                            soldOut ? "text-slate-500" : "text-slate-800"
                          }`}
                        >
                          {remaining.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Terjual
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          {Number(ticket.sold || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:col-span-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleEdit(ticket)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 sm:flex-none"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ticket.id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:flex-none"
                      >
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminTicketTypes;