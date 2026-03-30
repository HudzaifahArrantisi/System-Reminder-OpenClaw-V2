import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchTugas, submitTugas, type TugasItem } from "../api/client";
import { useAuth } from "../context/AuthContext";

const MAX_SIZE_MB = 20;

const allowedMimes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]);

const isAllowedFile = (file: File) => {
  if (allowedMimes.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg", "webp", "txt", "zip"].includes(ext);
};

export default function SubmissionFormPage() {
  const { tugasId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tugas, setTugas] = useState<TugasItem | null>(null);

  useEffect(() => {
    if (!tugasId || !user) return;

    setLoading(true);
    fetchTugas("mahasiswa", user.id)
      .then((items) => {
        const found = items.find((item) => String(item.id) === tugasId);
        if (!found) {
          setMsg("Tugas tidak ditemukan atau sudah pernah Anda kumpulkan.");
          setTugas(null);
          return;
        }
        setTugas(found);
      })
      .catch((err) => {
        setMsg(err instanceof Error ? err.message : "Gagal memuat detail tugas.");
      })
      .finally(() => setLoading(false));
  }, [tugasId, user]);

  const fileSizeLabel = useMemo(() => {
    if (!selectedFile) return "";
    return `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [selectedFile]);

  const onFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedFile(file)) {
      setMsg("Format file belum didukung. Gunakan PDF, DOC/DOCX, gambar, PPT, XLS, TXT, atau ZIP.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMsg(`Ukuran file maksimal ${MAX_SIZE_MB} MB.`);
      setSelectedFile(null);
      return;
    }

    setMsg("");
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !tugas || !user) {
      setMsg("Pilih file jawaban terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setMsg("");
    try {
      await submitTugas(tugas.id, user.id, selectedFile);
      setMsg("Jawaban berhasil dikumpulkan. Anda akan diarahkan ke dashboard mahasiswa.");
      setSelectedFile(null);
      setTimeout(() => navigate("/mahasiswa"), 1200);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal mengumpulkan tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-black text-white">Form Pengumpulan Tugas</h1>
        <Link
          to="/mahasiswa"
          className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
        >
          Kembali
        </Link>
      </div>

      {msg && (
        <div className="glass-card p-4 border border-blue-500/30 text-blue-200 animate-slide-down">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="glass-card p-8 text-center text-slate-400">Memuat detail tugas...</div>
      ) : !tugas ? (
        <div className="glass-card p-8 text-center text-slate-400">Tidak ada data tugas untuk dikumpulkan.</div>
      ) : (
        <>
          <section className="glass-card p-6 border border-slate-700/70">
            <p className="text-xs uppercase tracking-widest text-slate-400">Detail Tugas</p>
            <h2 className="mt-2 text-xl font-bold text-white">{tugas.title}</h2>
            <p className="mt-2 text-slate-300">{tugas.description || "Tanpa deskripsi"}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{tugas.course_name}</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Pertemuan {tugas.pertemuan_ke}</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Deadline: {new Date(tugas.deadline).toLocaleDateString("id-ID")}</span>
            </div>
          </section>

          <section className="glass-card p-6 border border-slate-700/70">
            <h3 className="text-lg font-bold text-blue-200">Upload Jawaban</h3>
            <p className="mt-1 text-sm text-slate-400">
              Format: PDF, DOC, DOCX, PNG, JPG, WEBP, PPT, XLS, TXT, ZIP. Maksimal {MAX_SIZE_MB} MB.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 cursor-pointer hover:border-blue-400/40 transition-colors">
                <p className="text-sm text-slate-300">Pilih file jawaban</p>
                <input
                  type="file"
                  className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-200 hover:file:bg-blue-500/30"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </label>

              {selectedFile && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  <p className="font-semibold">File siap dikirim:</p>
                  <p>{selectedFile.name}</p>
                  <p className="text-xs text-emerald-300/90 mt-1">Ukuran: {fileSizeLabel}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedFile}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Mengirim jawaban..." : "Kumpulkan Tugas"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
