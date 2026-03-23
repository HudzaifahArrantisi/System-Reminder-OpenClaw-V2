import { useEffect, useState } from "react";
import { getAllTugas, type Tugas } from "../api/tugas";

interface TugasListProps {
  refreshKey: number;
}

/**
 * TugasList — Menampilkan daftar tugas dari database.
 * Otomatis refresh ketika refreshKey berubah.
 */
export default function TugasList({ refreshKey }: TugasListProps) {
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllTugas();
      setTugasList(data);
    } catch {
      setError("Gagal memuat data tugas.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menentukan badge warna berdasarkan sisa hari deadline.
   */
  const getDeadlineBadge = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    const diff = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-400">Lewat</span>;
    if (diff === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Hari ini!</span>;
    if (diff <= 3) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">{diff} hari lagi</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">{diff} hari lagi</span>;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
          <span className="ml-3 text-slate-400">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> Daftar Tugas
          <span className="ml-auto text-sm font-normal text-slate-400">
            {tugasList.length} tugas
          </span>
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm mb-4">
            ❌ {error}
          </div>
        )}

        {tugasList.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <span className="text-4xl block mb-3">📭</span>
            Belum ada tugas. Tambahkan tugas pertamamu!
          </div>
        ) : (
          <div className="space-y-3">
            {tugasList.map((tugas) => (
              <div
                key={tugas.id}
                className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {tugas.nama_tugas}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      📚 {tugas.matkul} · Pertemuan {tugas.pertemuan}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Dibuat: {tugas.tanggal_dibuat} · Deadline: {tugas.deadline}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getDeadlineBadge(tugas.deadline)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
