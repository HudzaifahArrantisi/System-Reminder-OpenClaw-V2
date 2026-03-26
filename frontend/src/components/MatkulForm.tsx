import { useState } from "react";
import { createMatkul } from "../api/tugasApi";

interface MatkulFormProps {
  onSuccess: () => void;
}

/**
 * MatkulForm — Form input mata kuliah baru.
 */
export default function MatkulForm({ onSuccess }: MatkulFormProps) {
  const [namaMatkul, setNamaMatkul] = useState("");
  const [kodeMatkul, setKodeMatkul] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMatkul.trim() || !kodeMatkul.trim()) {
      setError("Semua field wajib diisi");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createMatkul({
        nama_matkul: namaMatkul.trim(),
        kode_matkul: kodeMatkul.trim().toUpperCase(),
      });
      setSuccess(true);
      setNamaMatkul("");
      setKodeMatkul("");
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan mata kuliah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">📚</span> Tambah Mata Kuliah
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nama Mata Kuliah
          </label>
          <input
            type="text"
            value={namaMatkul}
            onChange={(e) => setNamaMatkul(e.target.value)}
            required
            placeholder="Contoh: Pemrograman Web"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Kode Mata Kuliah
          </label>
          <input
            type="text"
            value={kodeMatkul}
            onChange={(e) => setKodeMatkul(e.target.value)}
            required
            placeholder="Contoh: IF231"
            className="input-field"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm animate-slide-down">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm animate-slide-down">
            ✅ Mata kuliah berhasil disimpan!
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Matkul"}
        </button>
      </form>
    </div>
  );
}
