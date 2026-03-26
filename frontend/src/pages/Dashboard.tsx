import { useState, useEffect, useCallback } from "react";
import { getAllTugas, type Tugas } from "../api/tugasApi";
import TugasForm from "../components/TugasForm";
import TugasTable from "../components/TugasTable";
import MatkulForm from "../components/MatkulForm";

/**
 * Dashboard — Halaman utama yang menampilkan stats, form matkul & tugas, dan tabel tugas.
 */
export default function Dashboard() {
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Tugas | null>(null);
  const [showMatkulForm, setShowMatkulForm] = useState(false);
  const [matkulRefreshKey, setMatkulRefreshKey] = useState(0);

  const fetchTugas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTugas();
      setTugasList(data);
    } catch {
      console.error("Gagal memuat data tugas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTugas();
  }, [fetchTugas]);

  const handleTugasSuccess = () => {
    setEditData(null);
    fetchTugas();
  };

  const handleMatkulSuccess = () => {
    setMatkulRefreshKey((prev) => prev + 1);
    setShowMatkulForm(false);
  };

  const handleEdit = (tugas: Tugas) => {
    setEditData(tugas);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stats
  const totalTugas = tugasList.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineToday = tugasList.filter((t) => {
    const dl = new Date(t.deadline);
    dl.setHours(0, 0, 0, 0);
    return dl.getTime() === today.getTime();
  }).length;

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const deadlineWeek = tugasList.filter((t) => {
    const dl = new Date(t.deadline);
    dl.setHours(0, 0, 0, 0);
    return dl >= today && dl <= endOfWeek;
  }).length;

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          📚 Tugas Reminder
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Sistem reminder tugas mahasiswa otomatis via Telegram
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Online
          </span>
          <span>React → Golang → PostgreSQL → OpenClaw → Telegram</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Tugas</p>
              <p className="text-3xl font-bold text-white mt-1">{totalTugas}</p>
            </div>
            <div className="text-3xl opacity-50">📊</div>
          </div>
        </div>

        <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Deadline Minggu Ini</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{deadlineWeek}</p>
            </div>
            <div className="text-3xl opacity-50">📅</div>
          </div>
        </div>

        <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Deadline Hari Ini</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{deadlineToday}</p>
            </div>
            <div className="text-3xl opacity-50">🔴</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toggle Matkul Form */}
          <button
            onClick={() => setShowMatkulForm(!showMatkulForm)}
            className="w-full text-left glass-card p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              📚 Kelola Mata Kuliah
            </span>
            <span className="text-slate-500 text-lg">
              {showMatkulForm ? "▲" : "▼"}
            </span>
          </button>

          {showMatkulForm && (
            <div className="animate-slide-down">
              <MatkulForm onSuccess={handleMatkulSuccess} />
            </div>
          )}

          {/* Tugas Form */}
          <TugasForm
            key={matkulRefreshKey}
            onSuccess={handleTugasSuccess}
            editData={editData}
            onCancelEdit={() => setEditData(null)}
          />
        </div>

        {/* Right Column - Table */}
        <div className="lg:col-span-3">
          <TugasTable
            tugasList={tugasList}
            loading={loading}
            onEdit={handleEdit}
            onRefresh={fetchTugas}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto text-center mt-10 text-xs text-slate-600">
        Tugas Reminder System © 2026 — Powered by React + Golang + OpenClaw
      </footer>
    </div>
  );
}
