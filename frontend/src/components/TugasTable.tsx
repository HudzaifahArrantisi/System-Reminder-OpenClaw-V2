import { useState } from "react";
import { deleteTugas, type Tugas } from "../api/tugasApi";

interface TugasTableProps {
  tugasList: Tugas[];
  loading: boolean;
  onEdit: (tugas: Tugas) => void;
  onRefresh: () => void;
}

/**
 * TugasTable — Tabel daftar tugas dengan badge deadline, aksi edit & hapus.
 */
export default function TugasTable({
  tugasList,
  loading,
  onEdit,
  onRefresh,
}: TugasTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDeadlineBadge = (deadline: string) => {
    const diff = getDaysLeft(deadline);

    if (diff < 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-600/50 text-slate-400">
          Lewat
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 animate-pulse-glow">
          🔴 Hari ini!
        </span>
      );
    }
    if (diff <= 3) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
          {diff} hari lagi
        </span>
      );
    }
    if (diff <= 7) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
          {diff} hari lagi
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
        {diff} hari lagi
      </span>
    );
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteTugas(id);
      setDeleteId(null);
      onRefresh();
    } catch {
      alert("Gagal menghapus tugas");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
          <span className="ml-3 text-slate-400">Memuat data tugas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">📋</span> Daftar Tugas
        </h2>
        <span className="text-sm font-normal text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
          {tugasList.length} tugas
        </span>
      </div>

      {tugasList.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-lg">Belum ada tugas</p>
          <p className="text-sm mt-1">Tambahkan tugas pertamamu di form sebelah kiri!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {tugasList.map((tugas) => (
            <div
              key={tugas.id}
              className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 hover:border-slate-600/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate text-base">
                    {tugas.nama_tugas}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md text-xs font-medium">
                      {tugas.nama_matkul}
                    </span>
                    {tugas.kode_matkul && (
                      <span className="text-xs text-slate-500">({tugas.kode_matkul})</span>
                    )}
                    <span className="text-slate-600">·</span>
                    <span>Pertemuan {tugas.pertemuan}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    📅 Deadline: {formatDate(tugas.deadline)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {getDeadlineBadge(tugas.deadline)}

                  {/* Action buttons */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(tugas)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(tugas.id)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Hapus"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>

              {/* Konfirmasi hapus */}
              {deleteId === tugas.id && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 animate-slide-down">
                  <p className="text-sm text-slate-300 mb-2">
                    Yakin ingin menghapus tugas ini?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(tugas.id)}
                      disabled={deleting}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
