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
          response.data.message || "Register gagal"
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
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white px-6 py-12">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-100 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-fuchsia-100 blur-3xl" />

      {/* Register */}
      <div className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center">

        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">

            

            <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
              Buat Akun
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Daftar dan mulai pesan tiket konser favoritmu.
            </p>

          </div>

          {/* Card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl shadow-neutral-200/50 sm:p-8">

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Nama */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Nama
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-neutral-800">
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
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />

              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Mendaftarkan..."
                  : "Daftar"}
              </button>

            </form>

            {/* Login */}
            <div className="mt-6 border-t border-neutral-200 pt-6 text-center">

              <p className="text-sm text-neutral-500">
                Sudah punya akun?
              </p>

              <Link
                to="/login"
                className="mt-1 inline-block text-sm font-bold text-violet-600 transition hover:text-violet-700"
              >
                Login sekarang
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;