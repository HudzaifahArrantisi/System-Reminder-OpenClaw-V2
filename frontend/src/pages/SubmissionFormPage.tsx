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

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
      setTimeout(() => navigate("/mahasiswa/dashboard"), 1200);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal mengumpulkan tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-7 animate-fade-in-up">
        <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-8 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">Portal Pengumpulan</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-black text-white">Kumpulkan Tugas Mahasiswa</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Pastikan file jawaban final sudah benar sebelum dikirim. Setelah submit, tugas tidak akan muncul lagi di daftar aktif.
            </p>
          </div>

          <Link
            to="/mahasiswa/dashboard"
            className="inline-flex rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
          >
            Kembali
          </Link>
        </div>
      </section>

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Detail Tugas</p>
                <h2 className="mt-2 text-xl font-bold text-white">{tugas.title}</h2>
                <p className="mt-2 text-slate-300">{tugas.description || "Tanpa deskripsi"}</p>
              </div>
              <span className="inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">
                Deadline {formatDate(tugas.deadline)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{tugas.course_name}</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Pertemuan {tugas.pertemuan_ke}</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Upload: {formatDate(tugas.tanggal_upload)}</span>
            </div>
          </section>

          <section className="glass-card p-6 border border-slate-700/70">
            <h3 className="text-lg font-bold text-blue-200">Upload Jawaban</h3>
            <p className="mt-1 text-sm text-slate-400">
              Format: PDF, DOC, DOCX, PNG, JPG, WEBP, PPT, XLS, TXT, ZIP. Maksimal {MAX_SIZE_MB} MB.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block rounded-xl border border-dashed border-slate-600 bg-slate-900/60 p-4 cursor-pointer hover:border-blue-400/40 transition-colors">
                <p className="text-sm font-semibold text-slate-200">Pilih file jawaban</p>
                <p className="mt-1 text-xs text-slate-400">Klik area ini lalu pilih file yang ingin dikumpulkan.</p>
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-semibold hover:from-fuchsia-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
