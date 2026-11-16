
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-[calc(100vh-80px)] bg-[#f7f7fa] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12">

      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/5 lg:grid lg:grid-cols-2 lg:min-h-[620px]">

        {/* LEFT PANEL */}
        <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden bg-[#513477] px-6 py-10 sm:min-h-[230px] lg:min-h-full lg:px-12">

          {/* Background Decoration */}
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="absolute right-0 top-0 h-full w-1/2 bg-fuchsia-500/10" />

          {/* Branding */}
          <div className="relative z-10 text-center">

            <h1 className="text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl">
              CONCERTIX
            </h1>

            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-fuchsia-400" />

            <p className="mt-4 text-sm text-white/70">
              Your ticket, your experience.
            </p>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-12">

          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Create Account
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Buat akun Concertix dan mulai pesan tiket
                konser favoritmu.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-[#fafafa] px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-600/10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-[#fafafa] px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-600/10"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-neutral-200 bg-[#fafafa] px-4 py-3.5 pr-16 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-600/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 transition hover:text-violet-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-neutral-400">
                  Gunakan minimal 6 karakter.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-700 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-800 active:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Mendaftarkan..." : "Create Account"}
              </button>

            </form>

            {/* Login */}
            <div className="mt-7 border-t border-neutral-100 pt-6 text-center">

              <p className="text-sm text-neutral-500">
                Sudah punya akun?
                <Link
                  to="/login"
                  className="ml-1 font-semibold text-violet-700 transition hover:text-fuchsia-600"
                >
                  Login sekarang
                </Link>
              </p>

            </div>

            {/* Footer */}
            <p className="mt-7 text-center text-xs text-neutral-400">
              © {new Date().getFullYear()} Concertix. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;
