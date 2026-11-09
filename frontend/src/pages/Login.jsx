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

      sessionStorage.setItem(
        "token",
        response.data.token
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Check role dan redirect sesuai role
      const userRole = response.data.user?.role;

      if (userRole === "admin") {
        // Admin langsung ke dashboard
        navigate("/admin", { replace: true });
      } else {
        // User biasa cek selectedTicket atau ke home
        const selectedTicket =
          localStorage.getItem("selectedTicket");

        if (selectedTicket) {
          const ticketData = JSON.parse(selectedTicket);

          navigate(
            `/concert/${ticketData.concert_id}`
          );
        } else {
          navigate("/");
        }
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
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white px-6 py-16">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-100 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-fuchsia-100 blur-3xl" />

      {/* Login */}
      <div className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center">

        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">

         

            <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
              Login ke Concertix
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Masuk untuk melanjutkan pembelian tiketmu.
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

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

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
                  placeholder="Masukkan password"
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
                {loading ? "Memproses..." : "Login"}
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-neutral-200 pt-6 text-center">

              <p className="text-sm text-neutral-500">
                Belum punya akun?
              </p>

              <Link
                to="/register"
                className="mt-1 inline-block text-sm font-bold text-violet-600 transition hover:text-violet-700"
              >
                Daftar sekarang 
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;