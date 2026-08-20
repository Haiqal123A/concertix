import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Login gagal"
        );
      }

      // ===============================
      // SIMPAN TOKEN
      // ===============================
     sessionStorage.setItem(
  "token",
  response.data.token
);

sessionStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

      // ===============================
      // CEK TIKET YANG SEBELUMNYA DIPILIH
      // ===============================
      const selectedTicket =
        localStorage.getItem("selectedTicket");

      if (selectedTicket) {
        navigate(`/concert/${JSON.parse(selectedTicket).concert_id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-neutral-950 px-6 py-16 text-white">

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            WELCOME BACK
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Login ke Concertix
          </h1>

          <p className="mt-3 text-neutral-500">
            Masuk untuk melanjutkan pembelian tiketmu.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3.5 font-semibold text-neutral-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Login"}
            </button>

          </form>

          {/* Register */}
          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-neutral-500">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Daftar sekarang
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;