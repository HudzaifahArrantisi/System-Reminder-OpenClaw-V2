import { useState } from "react";
import TugasForm from "../components/TugasForm";
import TugasList from "../components/TugasList";

/**
 * Home — Halaman utama yang menampilkan form input dan daftar tugas.
 */
export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          📚 Tugas Reminder
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Sistem reminder tugas mahasiswa otomatis via Telegram
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Connected
          </span>
          <span>Frontend → Backend → PostgreSQL → OpenClaw → Telegram</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TugasForm onSuccess={handleRefresh} />
        <TugasList refreshKey={refreshKey} />
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto text-center mt-10 text-xs text-slate-600">
        Tugas Reminder System © 2026 — Powered by React + Golang + OpenClaw
      </footer>
    </div>
  );
}
