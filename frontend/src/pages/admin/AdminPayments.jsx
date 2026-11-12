import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Search,
  Ticket,
} from "lucide-react";
import QRCode from "qrcode";
import api from "../../services/api";

function AdminTicketQr({ ticketCode }) {
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(ticketCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    })
      .then((image) => {
        if (active) setQrImage(image);
      })
      .catch((err) => {
        console.error("GENERATE ADMIN TICKET QR ERROR:", err);
      });

    return () => {
      active = false;
    };
  }, [ticketCode]);

  if (!qrImage) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white text-center text-[10px] text-slate-400">
        Menyiapkan QR...
      </div>
    );
  }

  return (
    <img
      src={qrImage}
      alt={`QR tiket ${ticketCode}`}
      className="h-24 w-24 shrink-0 rounded-lg bg-white p-1"
    />
  );
}

const paymentStatuses = {
  paid: {
    label: "Berhasil",
    className: "bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Menunggu",
    className: "bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-rose-50 text-rose-700",
  },
  failed: {
    label: "Gagal",
    className: "bg-rose-50 text-rose-700",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600",
  },
};

const formatPaymentDate = (date) => {
  if (!date) return "Waktu tidak tersedia";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Waktu tidak tersedia";

  return parsedDate.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedTicketPayments, setExpandedTicketPayments] = useState(
    () => new Set()
  );

  useEffect(() => {
    let active = true;

    api
      .get("/payments/admin")
      .then((response) => {
        if (active) setPayments(response.data.data || []);
      })
      .catch((err) => {
        if (!active) return;

        console.error("GET ADMIN PAYMENTS ERROR:", err);
        setPaymentsError(
          err.response?.data?.message ||
            "Data pembayaran dan tiket tidak dapat dimuat."
        );
      })
      .finally(() => {
        if (active) setPaymentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const query = search.trim().toLocaleLowerCase("id-ID");
  const toggleTicketList = (paymentId) => {
    setExpandedTicketPayments((current) => {
      const next = new Set(current);
      if (next.has(paymentId)) {
        next.delete(paymentId);
      } else {
        next.add(paymentId);
      }
      return next;
    });
  };

  const filteredPayments = payments.filter((payment) => {
    const order = payment.orders;
    if (!query) return true;

    const textMatches = [
      order?.customer_name,
      order?.customer_email,
      ...(order?.concert_order_numbers || []).map(
        (item) => item.concerts?.title || ""
      ),
    ].some((value) =>
      String(value || "").toLocaleLowerCase("id-ID").includes(query)
    );
    const normalizedQuery = query
      .replace(/^(?:#|no\.?\s*)/i, "")
      .replace(/\s+/g, "");
    const identifiers = [
      payment.id,
      payment.order_id,
      order?.id,
      ...(order?.concert_order_numbers || []).map((item) =>
        String(item.order_number).padStart(2, "0")
      ),
    ];
    const idMatches =
      normalizedQuery.length > 0 &&
      identifiers.some((value) =>
        String(value || "")
          .replace(/^(?:#|no\.?\s*)/i, "")
          .replace(/\s+/g, "")
          .includes(normalizedQuery)
      );

    return textMatches || idMatches;
  });

  const paidCount = payments.filter(
    (payment) => payment.status === "paid"
  ).length;
  const pendingCount = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const summaryCards = [
    {
      label: "Total transaksi",
      value: payments.length,
      icon: CreditCard,
      iconStyle: "bg-violet-50 text-violet-700",
    },
    {
      label: "Pembayaran berhasil",
      value: paidCount,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Menunggu pembayaran",
      value: pendingCount,
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto max-w-[1440px]">
        <header className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Pembayaran
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Pantau status pembayaran dan tiket pelanggan dalam satu tempat.
          </p>
        </header>

        <section
          aria-label="Ringkasan pembayaran"
          className="mb-8 grid gap-3 sm:grid-cols-3"
        >
          {summaryCards.map(
            ({ label, value, icon: Icon, iconStyle }) => (
              <article
                key={label}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {paymentsLoading || paymentsError
                      ? "—"
                      : value.toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                >
                  <Icon size={19} />
                </span>
              </article>
            )
          )}
        </section>

        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Pembayaran & tiket
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredPayments.length.toLocaleString("id-ID")} transaksi
                ditampilkan. Cari nama, email, atau nomor pesanan.
              </p>
            </div>

            <label className="relative block w-full sm:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, email, atau ID transaksi..."
                aria-label="Cari pembayaran berdasarkan nama, email, atau ID transaksi"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>

          {paymentsError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {paymentsError}
            </p>
          )}

          {paymentsLoading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Memuat data pembayaran dan tiket...
            </div>
          ) : !paymentsError && filteredPayments.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CreditCard size={21} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                {payments.length === 0
                  ? "Belum ada data pembayaran"
                  : "Tidak ada data yang cocok"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {payments.length === 0
                  ? "Data transaksi pelanggan akan muncul di sini."
                  : "Coba kata kunci nama, email, atau nomor pesanan lain."}
              </p>
            </div>
          ) : (
            <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPayments.map((payment) => {
                const order = payment.orders;
                const tickets = order?.tickets || [];
                const ticketsExpanded = expandedTicketPayments.has(payment.id);
                const visibleTickets = ticketsExpanded
                  ? tickets
                  : tickets.slice(0, 1);
                const concertOrders = order?.concert_order_numbers || [];
                const status = paymentStatuses[payment.status] || {
                  label: payment.status || "Tidak diketahui",
                  className: "bg-slate-100 text-slate-600",
                };

                return (
                  <article
                    key={payment.id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <header className="border-b border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-950">
                            {order?.customer_name || "Nama belum diisi"}
                          </h3>
                          <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                            {order?.customer_email || "Email belum diisi"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            ID transaksi
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {concertOrders.length > 0
                              ? concertOrders
                                  .map(
                                    (concertOrder) =>
                                      `No. ${String(
                                        concertOrder.order_number
                                      ).padStart(2, "0")}`
                                  )
                                  .join(" · ")
                              : `#${payment.order_id || order?.id || "-"}`}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Waktu transaksi
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {formatPaymentDate(payment.payment_date)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-500">
                          Total pembayaran
                        </span>
                        <span className="text-sm font-bold text-slate-950">
                          Rp{" "}
                          {Number(order?.total_price || 0).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </header>

                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Ticket size={16} className="text-violet-600" />
                          Tiket terbit
                        </p>
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                          {tickets.length}
                        </span>
                      </div>

                      {tickets.length > 0 ? (
                        <div className="mt-3">
                          <div className="space-y-2">
                            {visibleTickets.map((ticket) => {
                              const item = Array.isArray(ticket.order_items)
                                ? ticket.order_items[0]
                                : ticket.order_items;
                              const ticketType = Array.isArray(
                                item?.ticket_types
                              )
                                ? item.ticket_types[0]
                                : item?.ticket_types;
                              const concert = Array.isArray(
                                ticketType?.concerts
                              )
                                ? ticketType.concerts[0]
                                : ticketType?.concerts;

                              return (
                                <div
                                  key={ticket.id}
                                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                                >
                                  {ticket.ticket_code && (
                                    <AdminTicketQr
                                      ticketCode={ticket.ticket_code}
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">
                                      {concert?.title || "Tiket konser"}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                      {ticketType?.name || "Tiket"} · Pengunjung{" "}
                                      {ticket.attendee_number}
                                    </p>
                                    <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                                      {ticket.ticket_code}
                                    </p>
                                    <span
                                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        ticket.checked_in_at
                                          ? "bg-slate-200 text-slate-600"
                                          : "bg-emerald-50 text-emerald-700"
                                      }`}
                                    >
                                      {ticket.checked_in_at
                                        ? "Sudah masuk"
                                        : "Belum dipakai"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {tickets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleTicketList(payment.id)}
                              aria-expanded={ticketsExpanded}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                            >
                              {ticketsExpanded ? (
                                <>
                                  Sembunyikan tiket lain
                                  <ChevronUp size={15} />
                                </>
                              ) : (
                                <>
                                  Lihat {tickets.length - 1} tiket lainnya
                                  <ChevronDown size={15} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                          {payment.status === "paid"
                            ? "Belum ada tiket untuk pembayaran ini."
                            : "Tiket akan muncul setelah pembayaran dikonfirmasi."}
                        </p>
                      )}
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

export default AdminPayments;
