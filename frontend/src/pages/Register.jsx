import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Register gagal"
        );
      }

      setSuccess(
        "Registrasi berhasil! Mengarahkan ke halaman login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Register gagal. Silakan coba lagi."
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
            JOIN CONCERTIX
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Buat Akun
          </h1>

          <p className="mt-3 text-neutral-500">
            Daftar dan mulai pesan tiket konser favoritmu.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Nama
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

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
                placeholder="Minimal 6 karakter"
                minLength={6}
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
              {loading
                ? "Mendaftarkan..."
                : "Daftar"}
            </button>

          </form>

          {/* Login */}
          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-neutral-500">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Login sekarang
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;