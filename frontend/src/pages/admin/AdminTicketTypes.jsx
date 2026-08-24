import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminTicketTypes() {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [concerts, setConcerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      setLoading(true);
      setError("");

      const [ticketResponse, concertResponse] =
        await Promise.all([
          api.get("/ticket-types"),
          api.get("/concerts"),
        ]);

      setTicketTypes(ticketResponse.data.data || []);
      setConcerts(concertResponse.data.data || []);
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
    getData();
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
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus ticket type ini?"
    );

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Memuat data ticket...
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
              Kelola Tiket
            </h1>

            <p className="text-zinc-400 mt-2">
              Kelola jenis tiket, harga, dan stok
              Concertix.
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
              : "+ Tambah Tiket"}
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
                  ? "Edit Ticket"
                  : "Tambah Ticket"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Tentukan konser, jenis tiket, harga,
                dan stok.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* CONCERT */}

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Konser
                </label>

                <select
                  name="concert_id"
                  value={form.concert_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-purple-500"
                >
                  <option value="">
                    Pilih Konser
                  </option>

                  {concerts.map((concert) => (
                    <option
                      key={concert.id}
                      value={concert.id}
                    >
                      {concert.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAME */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Nama Tiket
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: VIP, Regular, VVIP"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* PRICE */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Harga
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Contoh: 250000"
                  min="0"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* STOCK */}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Stok Tiket
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Contoh: 500"
                  min="0"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* SOLD */}

              {editingId && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Tiket Terjual
                  </label>

                  <input
                    type="text"
                    value={
                      ticketTypes.find(
                        (ticket) =>
                          ticket.id === editingId
                      )?.sold || 0
                    }
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-zinc-500"
                  />
                </div>
              )}

              {/* BUTTON */}

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">

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
                    : "Tambah Tiket"}
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            TICKET LIST
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10">

            <h2 className="text-xl font-bold">
              Daftar Tiket
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              {ticketTypes.length} ticket type
              terdaftar
            </p>

          </div>

          {ticketTypes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-500">
                Belum ada ticket type.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>
                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Tiket
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Konser
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Harga
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Stok
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500">
                      Terjual
                    </th>

                    <th className="px-6 py-4 text-sm text-zinc-500 text-right">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {ticketTypes.map((ticket) => (

                    <tr
                      key={ticket.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >

                      {/* TICKET */}

                      <td className="px-6 py-5">

                        <p className="font-semibold">
                          {ticket.name}
                        </p>

                        <p className="text-sm text-zinc-500 mt-1">
                          ID #{ticket.id}
                        </p>

                      </td>

                      {/* CONCERT */}

                      <td className="px-6 py-5">

                        <p className="text-zinc-300">
                          {ticket.concerts?.title ||
                            "-"}
                        </p>

                        {ticket.concerts
                          ?.concert_date && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {formatDate(
                              ticket.concerts
                                .concert_date
                            )}
                          </p>
                        )}

                      </td>

                      {/* PRICE */}

                      <td className="px-6 py-5">

                        <p className="font-semibold text-purple-400">
                          {formatRupiah(
                            ticket.price
                          )}
                        </p>

                      </td>

                      {/* STOCK */}

                      <td className="px-6 py-5">

                        <p className="text-zinc-300">
                          {Number(
                            ticket.stock || 0
                          ).toLocaleString("id-ID")}
                        </p>

                      </td>

                      {/* SOLD */}

                      <td className="px-6 py-5">

                        <p className="text-green-400">
                          {Number(
                            ticket.sold || 0
                          ).toLocaleString("id-ID")}
                        </p>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(ticket)
                            }
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                ticket.id
                              )
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

export default AdminTicketTypes;