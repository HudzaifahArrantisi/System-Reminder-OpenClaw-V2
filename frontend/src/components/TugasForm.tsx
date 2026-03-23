import { useState } from "react";
import { createTugas, type CreateTugasPayload } from "../api/tugas";

interface TugasFormProps {
  onSuccess: () => void;
}

/**
 * TugasForm — Form input tugas baru dengan validasi.
 * Mengirim data ke backend via POST /tugas.
 */
export default function TugasForm({ onSuccess }: TugasFormProps) {
  const [form, setForm] = useState<CreateTugasPayload>({
    matkul: "",
    pertemuan: 1,
    nama_tugas: "",
    tanggal_dibuat: new Date().toISOString().split("T")[0],
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pertemuan" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createTugas(form);
      setSuccess(true);
      setForm({
        matkul: "",
        pertemuan: 1,
        nama_tugas: "",
        tanggal_dibuat: new Date().toISOString().split("T")[0],
        deadline: "",
      });
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Gagal menyimpan tugas. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span> Tambah Tugas Baru
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mata Kuliah */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Mata Kuliah
            </label>
            <input
              type="text"
              name="matkul"
              value={form.matkul}
              onChange={handleChange}
              required
              placeholder="Contoh: Pemrograman Web"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Pertemuan */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Pertemuan ke-
            </label>
            <input
              type="number"
              name="pertemuan"
              value={form.pertemuan}
              onChange={handleChange}
              required
              min={1}
              max={16}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Nama Tugas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nama Tugas
            </label>
            <input
              type="text"
              name="nama_tugas"
              value={form.nama_tugas}
              onChange={handleChange}
              required
              placeholder="Contoh: Membuat REST API"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Tanggal Dibuat */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Tanggal Dibuat
            </label>
            <input
              type="date"
              name="tanggal_dibuat"
              value={form.tanggal_dibuat}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm">
              ✅ Tugas berhasil disimpan!
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "⏳ Menyimpan..." : "💾 Simpan Tugas"}
          </button>
        </form>
      </div>
    </div>
  );
}
