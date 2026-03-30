import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTugas, type TugasItem } from "../api/client";
import { useAuth } from "../context/AuthContext";

type ActiveFilter = "all" | "h3" | "h2" | "h1" | "h0";

const filterLabels: Record<ActiveFilter, string> = {
  all: "Semua",
  h3: "H-3",
  h2: "H-2",
  h1: "H-1",
  h0: "H0",
};

const getDaysLeft = (deadline: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getBadge = (daysLeft: number) => {
  if (daysLeft === 0) {
    return (
      <span className="px-2.5 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse-glow">
        H0 - Hari Ini
      </span>
    );
  }
  if (daysLeft === 1) {
    return <span className="px-2.5 py-1 text-xs rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">H-1</span>;
  }
  if (daysLeft === 2) {
    return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">H-2</span>;
  }
  return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">H-3</span>;
};

export default function MahasiswaDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const loadTugasMahasiswa = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchTugas("mahasiswa", user.id);
      setTugasList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTugasMahasiswa();
  }, [user]);

  const tugasMendekati = useMemo(
    () =>
      tugasList
        .map((t) => ({ ...t, daysLeft: getDaysLeft(t.deadline) }))
        .filter((t) => t.daysLeft >= 0 && t.daysLeft <= 3)
        .sort((a, b) => a.daysLeft - b.daysLeft || new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [tugasList]
  );

  const tugasFiltered = useMemo(
    () =>
      tugasMendekati.filter((t) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "h3") return t.daysLeft === 3;
        if (activeFilter === "h2") return t.daysLeft === 2;
        if (activeFilter === "h1") return t.daysLeft === 1;
        return t.daysLeft === 0;
      }),
    [activeFilter, tugasMendekati]
  );

  const tugasTerbaru = useMemo(
    () =>
      [...tugasList]
        .sort(
          (a, b) =>
            new Date(b.tanggal_upload).getTime() - new Date(a.tanggal_upload).getTime() ||
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        .slice(0, 6),
    [tugasList]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-8 animate-fade-in-up">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Portal Mahasiswa</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-100 to-blue-200 bg-clip-text text-transparent">
            Fokus Deadline, Kumpulkan Tepat Waktu
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Semua tugas aktif Anda ditampilkan di satu tempat: tugas terbaru dari dosen dan prioritas deadline H-3 hingga H0.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/mahasiswa/courses"
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-900 font-semibold hover:bg-white transition-colors"
            >
              Lihat Semua Matkul
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: "0.03s" }}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-slate-100">Tugas Terbaru Dari Dosen</h2>
          <span className="text-xs text-slate-400">Urut dari terbaru</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Memuat tugas terbaru...</div>
        ) : tugasTerbaru.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Belum ada tugas aktif.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {tugasTerbaru.map((t) => (
              <Link
                key={`new-${t.id}`}
                to={`/mahasiswa/pengumpulan/${t.id}`}
                className="group rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 hover:border-blue-400/30 hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-100">{t.title}</h3>
                  <span className="text-[11px] px-2 py-1 rounded-md bg-blue-500/15 text-blue-200 border border-blue-500/20">
                    Baru
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.description || "Tanpa deskripsi"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">{t.course_name}</span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">Pertemuan {t.pertemuan_ke}</span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">Upload: {new Date(t.tanggal_upload).toLocaleDateString("id-ID")}</span>
                </div>
                <p className="mt-3 text-sm text-blue-300 font-semibold group-hover:text-blue-200 transition-colors">
                  Buka tugas &rarr;
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <div className="glass-card p-4 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total H-3 s.d H0</p>
          <p className="text-3xl font-extrabold text-slate-200 mt-2">{tugasMendekati.length}</p>
        </div>
        <div className="glass-card p-4 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">H-3</p>
          <p className="text-3xl font-extrabold text-slate-200 mt-2">{tugasMendekati.filter((t) => t.daysLeft === 3).length}</p>
        </div>
        <div className="glass-card p-4 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">H-2 / H-1</p>
          <p className="text-3xl font-extrabold text-slate-200 mt-2">{tugasMendekati.filter((t) => t.daysLeft === 2 || t.daysLeft === 1).length}</p>
        </div>
        <div className="glass-card p-4 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">H0 Hari Ini</p>
          <p className="text-3xl font-extrabold text-slate-200 mt-2">{tugasMendekati.filter((t) => t.daysLeft === 0).length}</p>
        </div>
      </section>

      <section className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-wrap gap-2 mb-5">
          {(Object.keys(filterLabels) as ActiveFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === key
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {filterLabels[key]}
            </button>
          ))}
          <button
            onClick={loadTugasMahasiswa}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors"
          >
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 animate-fade-in-up">Memuat daftar tugas...</div>
        ) : tugasFiltered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 animate-fade-in-up">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg font-semibold text-slate-200">Tidak ada tugas pada filter ini</p>
            <p className="text-sm mt-2">Semua aman. Lanjutkan progres belajar Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tugasFiltered.map((t, index) => (
              <Link
                key={t.id}
                to={`/mahasiswa/pengumpulan/${t.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 p-5 hover:border-blue-400/40 hover:-translate-y-0.5 transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-white leading-snug">{t.title}</h3>
                    {getBadge(t.daysLeft)}
                  </div>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{t.description || "Tanpa deskripsi"}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{t.course_name}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Pertemuan {t.pertemuan_ke}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Deadline: {new Date(t.deadline).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="mt-4 text-sm text-blue-300 font-semibold group-hover:translate-x-1 transition-transform">
                    Buka form pengumpulan tugas &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
