import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<"dosen" | "mahasiswa">("mahasiswa");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      login(data.user);
      navigate(`/${data.user.role}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome to OpenClaw
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Login Sebagai</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="mahasiswa"
                  checked={role === "mahasiswa"}
                  onChange={() => setRole("mahasiswa")}
                  className="peer sr-only"
                />
                <div className="py-2 px-4 text-center rounded-lg border-2 border-slate-700 text-slate-400 peer-checked:border-indigo-500 peer-checked:text-indigo-400 peer-checked:bg-indigo-500/10 transition-all">
                  Mahasiswa
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="dosen"
                  checked={role === "dosen"}
                  onChange={() => setRole("dosen")}
                  className="peer sr-only"
                />
                <div className="py-2 px-4 text-center rounded-lg border-2 border-slate-700 text-slate-400 peer-checked:border-indigo-500 peer-checked:text-indigo-400 peer-checked:bg-indigo-500/10 transition-all">
                  Dosen
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all"
              placeholder={role === 'dosen' ? "e.g. Bapak Dosen" : "e.g. Mahasiswa Budi"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            Masuk Sistem
          </button>
        </form>
      </div>
    </div>
  );
}
