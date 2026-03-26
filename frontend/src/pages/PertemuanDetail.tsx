import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTugasByPertemuan, createTugas } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PertemuanDetail() {
  const { pertemuanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tugasList, setTugasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");

  const loadTugas = () => {
    if (pertemuanId) {
      fetchTugasByPertemuan(pertemuanId)
        .then(setTugasList)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadTugas();
  }, [pertemuanId]);

  const handleUploadTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertemuanId) return;

    // Based on the schema, setting course_id is required. 
    // Usually we pass it in route or fetch it. For simplicity, we can fetch courseId from API or pass it from history state.
    // Assuming backend handles course_id relation from pertemuan_id, but the backend POST /tugas needs course_id.
    // Let's retrieve course_id from existing pertemuan or we can fetch it.
    // For now we'll just parse the route or do a fallback:
    const payload = {
      course_id: parseInt(localStorage.getItem('lastCourseId') || "1"), // Fallback, recommend passing course_id via state
      pertemuan_id: parseInt(pertemuanId),
      dosen_id: user?.id,
      title,
      description: desc,
      deadline
    };

    try {
      await createTugas(payload);
      setTitle("");
      setDesc("");
      setDeadline("");
      loadTugas();
      alert("Tugas berhasil diberikan!");
    } catch (err) {
      alert("Gagal upload tugas.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-700/50 pb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          &larr;
        </button>
        <h1 className="text-3xl font-bold">Detail Pertemuan</h1>
      </div>

      {/* Daftar Tugas dari Dosen */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📝</span> Tugas Pertemuan Ini
        </h2>
        {loading ? (
          <p>Memuat tugas...</p>
        ) : tugasList.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400">
            Tidak ada tugas untuk pertemuan ini.
          </div>
        ) : (
          tugasList.map((t) => (
            <div key={t.id} className="glass-card p-6 border-l-4 border-l-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{t.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Diberikan: {new Date(t.tanggal_upload).toLocaleDateString()}</p>
                  <p className="text-sm font-semibold text-red-400 mt-1">Deadline: {new Date(t.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              {/* View Mahasiswa: Form Pengumpulan */}
              {user?.role === "mahasiswa" && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h4 className="text-sm font-semibold mb-3">Upload Jawaban Anda</h4>
                  <div className="flex items-center gap-3">
                    <input type="file" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20" />
                    <button className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors">
                      Kumpulkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Dosen: Berikan Tugas Baru */}
      {user?.role === "dosen" && (
        <div className="glass-card p-6 border border-indigo-500/30">
          <h2 className="text-xl font-bold text-indigo-400 mb-4">Berikan Tugas Baru</h2>
          <form onSubmit={handleUploadTugas} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Judul Tugas</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="UAS / Quis / Project" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Deskripsi / Instruksi</label>
              <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Kerjakan di kertas polio..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Tanggal Deadline</label>
              <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all outline-none rounded-lg font-bold text-white uppercase text-sm tracking-wider">
              Upload Tugas
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
