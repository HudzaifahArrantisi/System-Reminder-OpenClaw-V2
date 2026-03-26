import { useState, useEffect } from "react";
import {
  createTugas,
  updateTugas,
  getAllMatkul,
  type CreateTugasPayload,
  type Matkul,
  type Tugas,
} from "../api/tugasApi";

interface TugasFormProps {
  onSuccess: () => void;
  editData?: Tugas | null;
  onCancelEdit?: () => void;
}

/**
 * TugasForm — Form input/edit tugas dengan dropdown matkul dan preview reminder.
 */
export default function TugasForm({ onSuccess, editData, onCancelEdit }: TugasFormProps) {
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [form, setForm] = useState<CreateTugasPayload>({
    matkul_id: "",
    pertemuan: 1,
    nama_tugas: "",
    tanggal_dibuat: new Date().toISOString().split("T")[0],
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load matkul list
  useEffect(() => {
    fetchMatkul();
  }, []);

  // Pre-fill form jika edit mode
  useEffect(() => {
    if (editData) {
      setForm({
        matkul_id: editData.matkul_id,
        pertemuan: editData.pertemuan,
        nama_tugas: editData.nama_tugas,
        tanggal_dibuat: editData.tanggal_dibuat,
        deadline: editData.deadline,
      });
    }
  }, [editData]);

  const fetchMatkul = async () => {
    try {
      const data = await getAllMatkul();
      setMatkulList(data);
    } catch {
      console.error("Gagal memuat data matkul");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pertemuan" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (editData) {
        await updateTugas(editData.id, form);
      } else {
        await createTugas(form);
      }
      setSuccess(true);
      if (!editData) {
        setForm({
          matkul_id: "",
          pertemuan: 1,
          nama_tugas: "",
          tanggal_dibuat: new Date().toISOString().split("T")[0],
          deadline: "",
        });
      }
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan tugas");
    } finally {
      setLoading(false);
    }
  };

  // Hitung preview tanggal reminder
  const getReminderDates = () => {
    if (!form.deadline) return null;
    const dl = new Date(form.deadline);
    const h3 = new Date(dl);
    h3.setDate(h3.getDate() - 3);
    const h1 = new Date(dl);
    h1.setDate(h1.getDate() - 1);

    const fmt = (d: Date) =>
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    return { h3: fmt(h3), h1: fmt(h1), h0: fmt(dl) };
  };

  const reminderDates = getReminderDates();

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">{editData ? "✏️" : "📝"}</span>
          {editData ? "Edit Tugas" : "Tambah Tugas Baru"}
        </h2>
        {editData && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-slate-700/50"
          >
            ✕ Batal
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mata Kuliah - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Mata Kuliah
          </label>
          <select
            name="matkul_id"
            value={form.matkul_id}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">— Pilih Mata Kuliah —</option>
            {matkulList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_matkul} ({m.kode_matkul})
              </option>
            ))}
          </select>
          {matkulList.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">
              ⚠️ Belum ada mata kuliah. Tambahkan di form Mata Kuliah terlebih dahulu.
            </p>
          )}
        </div>

        {/* Pertemuan */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Pertemuan ke-
          </label>
          <select
            name="pertemuan"
            value={form.pertemuan}
            onChange={handleChange}
            required
            className="input-field"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Pertemuan {n}
              </option>
            ))}
          </select>
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
            placeholder="Contoh: Membuat REST API dengan Golang"
            className="input-field"
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
            className="input-field"
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
            className="input-field"
          />
        </div>

        {/* Preview Reminder Dates */}
        {reminderDates && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 animate-slide-down">
            <p className="text-sm font-medium text-indigo-300 mb-2">
              🔔 Reminder akan dikirim:
            </p>
            <div className="space-y-1 text-sm text-slate-300">
              <p>
                <span className="inline-block w-10 text-amber-400 font-medium">H-3</span>
                {reminderDates.h3}
              </p>
              <p>
                <span className="inline-block w-10 text-orange-400 font-medium">H-1</span>
                {reminderDates.h1}
              </p>
              <p>
                <span className="inline-block w-10 text-red-400 font-medium">H0</span>
                {reminderDates.h0}
              </p>
            </div>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm animate-slide-down">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm animate-slide-down">
            ✅ Tugas berhasil {editData ? "diupdate" : "disimpan"}!
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading
            ? "⏳ Menyimpan..."
            : editData
            ? "💾 Update Tugas"
            : "💾 Simpan Tugas"}
        </button>
      </form>
    </div>
  );
}
