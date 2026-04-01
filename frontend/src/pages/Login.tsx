import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_DEFAULT_PATH, type AppRole } from "../shared/config/roleConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const VALID_ROLES = new Set<AppRole>(["mahasiswa", "dosen", "admin", "ortu", "ormawa", "ukm"]);

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function parseResponseSafely(response: Response) {
    const rawText = await response.text();
    try {
      return rawText ? JSON.parse(rawText) : null;
    } catch {
      return {
        rawText,
      };
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await parseResponseSafely(res);
      if (!res.ok) {
        const isEndpointMissing = res.status === 404;
        if (isEndpointMissing) {
          throw new Error(
            "Endpoint auth tidak ditemukan. Pastikan backend modular aktif (jalankan npm run start di folder backend-node) dan hentikan server lama yang memakai port 5000."
          );
        }
        throw new Error(data?.error?.message || `Login gagal (${res.status})`);
      }

      const apiUser = data?.data?.user;
      const apiTokens = data?.data?.tokens;

      if (!apiUser?.role || !VALID_ROLES.has(apiUser.role as AppRole) || !apiTokens?.access_token || !apiTokens?.refresh_token) {
        throw new Error("Response login tidak valid");
      }

      const role = apiUser.role as AppRole;
      login({
        user: {
          id: apiUser.id,
          role,
          name: apiUser.full_name || apiUser.username || "User",
          username: apiUser.username,
          email: apiUser.email,
        },
        accessToken: apiTokens.access_token,
        refreshToken: apiTokens.refresh_token,
      });

      const from = (location.state as { from?: string } | null)?.from;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(ROLE_DEFAULT_PATH[role], { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.15),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_38%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center justify-center p-4 py-8 sm:p-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl shadow-slate-950/70 backdrop-blur-xl lg:grid-cols-[1.1fr_1fr]">
          <section className="relative hidden overflow-hidden border-r border-slate-800/80 p-10 lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,23,42,0.82),rgba(30,41,59,0.45))]" />
            <div className="relative space-y-8">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  OpenClaw Portal
                </p>
                <h1 className="mt-5 text-4xl font-bold leading-tight text-white">
                  Masuk dan kelola
                  <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent"> kelasmu lebih tenang</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                  Pantau pertemuan, deadline, dan reminder otomatis dalam satu dashboard yang rapi untuk dosen maupun mahasiswa.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Timeline tugas lebih jelas dan terukur",
                  "Role-based dashboard untuk dosen dan mahasiswa",
                  "Integrasi reminder agar deadline tidak terlewat",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-800/45 px-4 py-3 text-sm text-slate-200"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sign in</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Welcome Back</h2>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Back to Landing
              </Link>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Identifier</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Email atau username"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Redirect otomatis berdasarkan role akun: mahasiswa, dosen, admin, ormawa, ukm, atau ortu.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-900/40 transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Memproses..." : "Masuk Sistem"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
