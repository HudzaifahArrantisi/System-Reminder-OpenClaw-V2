import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTaskSubmissions, fetchTugas, type TugasItem } from "../api/client";
import { useAuth } from "../context/AuthContext";

type CourseSubmissionStatus = {
  courseName: string;
  taskCount: number;
  submissionCount: number;
  mahasiswaCount: number;
  nearestDeadline: string | null;
};

const formatDate = (dateValue: string | null) => {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function DosenDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [courseStatuses, setCourseStatuses] = useState<CourseSubmissionStatus[]>([]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchTugas("dosen", user.id)
      .then(async (tugas) => {
        const dosenTugas = tugas.filter((item) => String(item.dosen_id) === String(user.id));
        setTugasList(dosenTugas);

        if (dosenTugas.length === 0) {
          setCourseStatuses([]);
          return;
        }

        const taskSubmissionPairs = await Promise.all(
          dosenTugas.map(async (task) => {
            try {
              const payload = await fetchTaskSubmissions(task.id);
              return {
                taskId: task.id,
                submissionCount: payload.submissions.length,
                mahasiswaIds: [...new Set(payload.submissions.map((item) => String(item.mahasiswa_id)))],
              };
            } catch (_error) {
              return {
                taskId: task.id,
                submissionCount: 0,
                mahasiswaIds: [] as string[],
              };
            }
          })
        );

        const submissionMap = new Map(taskSubmissionPairs.map((entry) => [entry.taskId, entry]));
        const groupedByCourse = new Map<
          string,
          { courseName: string; taskCount: number; submissionCount: number; mahasiswaSet: Set<string>; nearestDeadline: string | null }
        >();

        dosenTugas.forEach((task) => {
          const courseName = task.course_name || "Mata Kuliah";
          const key = courseName.toLowerCase();

          if (!groupedByCourse.has(key)) {
            groupedByCourse.set(key, {
              courseName,
              taskCount: 0,
              submissionCount: 0,
              mahasiswaSet: new Set<string>(),
              nearestDeadline: null,
            });
          }

          const current = groupedByCourse.get(key);
          if (!current) return;

          current.taskCount += 1;
          const submission = submissionMap.get(task.id);
          current.submissionCount += submission?.submissionCount || 0;
          (submission?.mahasiswaIds || []).forEach((id) => current.mahasiswaSet.add(id));

          if (!current.nearestDeadline) {
            current.nearestDeadline = task.deadline;
          } else {
            const currentTs = new Date(current.nearestDeadline).getTime();
            const nextTs = new Date(task.deadline).getTime();
            if (!Number.isNaN(nextTs) && nextTs < currentTs) {
              current.nearestDeadline = task.deadline;
            }
          }
        });

        const statusRows: CourseSubmissionStatus[] = [...groupedByCourse.values()]
          .map((item) => ({
            courseName: item.courseName,
            taskCount: item.taskCount,
            submissionCount: item.submissionCount,
            mahasiswaCount: item.mahasiswaSet.size,
            nearestDeadline: item.nearestDeadline,
          }))
          .sort((left, right) => left.courseName.localeCompare(right.courseName, "id-ID"));

        setCourseStatuses(statusRows);
      })
      .catch((error) => {
        console.error("Gagal memuat dashboard dosen:", error);
        setTugasList([]);
        setCourseStatuses([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const twoMainCourses = useMemo(() => courseStatuses.slice(0, 2), [courseStatuses]);
  const totalMahasiswaSubmitted = useMemo(
    () => courseStatuses.reduce((acc, item) => acc + item.mahasiswaCount, 0),
    [courseStatuses]
  );
  const totalSubmissionFiles = useMemo(
    () => courseStatuses.reduce((acc, item) => acc + item.submissionCount, 0),
    [courseStatuses]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-8 animate-fade-in-up">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Portal Dosen</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-100 to-blue-200 bg-clip-text text-transparent">Ringkasan Pengumpulan Tugas</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">Dashboard dosen disederhanakan agar hanya menampilkan data penting: jumlah tugas, status pengumpulan mahasiswa, dan fokus Matkul A serta Matkul B.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/dosen/matkul"
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-900 font-semibold hover:bg-white transition-colors"
            >
              Buka Halaman Pertemuan
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total Tugas Diberikan</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{tugasList.length}</p>
        </article>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Mahasiswa Sudah Mengumpulkan</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{totalMahasiswaSubmitted}</p>
        </article>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total File Pengumpulan</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{totalSubmissionFiles}</p>
        </article>
      </section>

      <section className="glass-card p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-100">Status Pengumpulan Matkul A & B</h2>
          <span className="text-xs text-slate-400">Fokus matkul prioritas</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Memuat status pengumpulan...</div>
        ) : twoMainCourses.length === 0 ? (
          <div className="py-10 text-center text-slate-500">Belum ada tugas aktif untuk ditampilkan.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {twoMainCourses.map((item, index) => {
              return (
                <article
                  key={`course-status-${item.courseName}`}
                  className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">Matkul {index === 0 ? "A" : "B"}</p>
                    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300">
                      {item.taskCount} tugas
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-slate-100">{item.courseName}</h3>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-700/70 bg-slate-800/45 p-3">
                      <p className="text-[11px] uppercase tracking-widest text-slate-400">Mahasiswa Sudah Kumpul</p>
                      <p className="mt-1 text-2xl font-bold text-cyan-200">{item.mahasiswaCount}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-800/45 p-3">
                      <p className="text-[11px] uppercase tracking-widest text-slate-400">Total File Masuk</p>
                      <p className="mt-1 text-2xl font-bold text-indigo-200">{item.submissionCount}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">Deadline terdekat: {formatDate(item.nearestDeadline)}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
