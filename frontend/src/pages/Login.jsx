
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Login gagal");
      }

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      const userRole = response.data.user?.role;

      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "petugas") {
        navigate("/petugas/scan", { replace: true });
      } else {
        navigate("/", { replace: true });
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
        <div className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">

          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-9">

              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Masuk ke akun Concertix untuk melanjutkan
                pembelian tiket konser.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

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
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-neutral-200 bg-[#fafafa] px-4 py-3.5 pr-14 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-600/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 transition hover:text-violet-600"
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-700 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-800 active:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Sign in"}
              </button>

            </form>

            {/* Register */}
            <div className="mt-8 border-t border-neutral-100 pt-6 text-center">

              <p className="text-sm text-neutral-500">
                Belum punya akun?
                <Link
                  to="/register"
                  className="ml-1 font-semibold text-violet-700 transition hover:text-fuchsia-600"
                >
                  Daftar sekarang
                </Link>
              </p>

            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-neutral-400">
              © {new Date().getFullYear()} Concertix. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
