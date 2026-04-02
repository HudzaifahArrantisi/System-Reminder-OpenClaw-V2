import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  API_URL,
  createTugas,
  fetchCourses,
  fetchPertemuan,
  fetchTaskSubmissions,
  fetchTugasByPertemuan,
  type Course,
  type Pertemuan,
  type TugasSubmissionItem,
  type TugasItem,
} from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const MEETING_SLOTS = 16;
const API_ROOT = API_URL.replace(/\/api\/v1\/?$/, "");

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const toAbsoluteUploadUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_ROOT}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
};

export function RoleMatkulPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchCourses(user.role, user.id)
      .then((rows) => setCourses(rows))
      .catch((error) => {
        console.error("Gagal memuat mata kuliah:", error);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const coursesSorted = useMemo(
    () => [...courses].sort((left, right) => left.name.localeCompare(right.name, "id-ID")),
    [courses]
  );

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-slate-100">Mata Kuliah</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pilih mata kuliah dari database untuk membuka 16 pertemuan.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-400">Memuat mata kuliah...</div>
      ) : coursesSorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-slate-400">
          Belum ada mata kuliah yang tersedia untuk akun ini.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {coursesSorted.map((course, index) => (
            <Link
              key={`course-${course.id}`}
              to={`/${user?.role}/matkul/${course.id}`}
              className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 transition hover:border-cyan-400/35 hover:-translate-y-0.5"
            >
              <p className="text-xs uppercase tracking-widest text-cyan-300">Matkul {index + 1}</p>
              <h2 className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{course.name}</h2>
              <p className="mt-2 text-xs text-slate-400">Buka 16 pertemuan</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function RoleCourseMeetingsPage() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pertemuanList, setPertemuanList] = useState<Pertemuan[]>([]);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    fetchPertemuan(courseId)
      .then((rows) => setPertemuanList(rows))
      .catch((error) => {
        console.error("Gagal memuat pertemuan:", error);
        setPertemuanList([]);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const meetingsMap = useMemo(() => {
    const map = new Map<number, Pertemuan>();
    pertemuanList.forEach((item) => map.set(item.pertemuan_ke, item));
    return map;
  }, [pertemuanList]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to={`/${user?.role}/matkul`}
          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Kembali
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">16 Pertemuan</h1>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-400">Memuat pertemuan...</div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: MEETING_SLOTS }, (_, idx) => idx + 1).map((meetingNo) => {
            const row = meetingsMap.get(meetingNo);

            if (!row) {
              return (
                <div
                  key={`meeting-empty-${meetingNo}`}
                  className="rounded-xl border border-dashed border-slate-700 bg-slate-900/45 p-3 text-center"
                >
                  <p className="text-lg font-bold text-slate-500">{meetingNo}</p>
                  <p className="text-[11px] text-slate-500">Belum dibuat</p>
                </div>
              );
            }

            return (
              <Link
                key={`meeting-${row.id}`}
                to={`/${user?.role}/matkul/${courseId}/pertemuan/${row.id}`}
                className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3 text-center transition hover:border-cyan-400/35"
              >
                <p className="text-lg font-bold text-cyan-300">{meetingNo}</p>
                <p className="text-[11px] text-slate-400">Pertemuan</p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function RolePertemuanTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId, pertemuanId } = useParams();
  const isDosen = user?.role === "dosen";
  const isMahasiswa = user?.role === "mahasiswa";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<TugasItem[]>([]);
  const [submissionsByTask, setSubmissionsByTask] = useState<Record<number, TugasSubmissionItem[]>>({});
  const [openSubmissionsByTask, setOpenSubmissionsByTask] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const loadData = async () => {
    if (!pertemuanId || !user) return;

    setLoading(true);
    try {
      const rows = await fetchTugasByPertemuan(pertemuanId, user.role, user.id);
      setItems(rows);

      if (user.role === "dosen" && rows.length > 0) {
        const submissionPairs = await Promise.all(
          rows.map(async (task) => {
            try {
              const payload = await fetchTaskSubmissions(task.id);
              return [task.id, payload.submissions] as const;
            } catch (error) {
              console.error(`Gagal memuat pengumpulan untuk tugas ${task.id}:`, error);
              return [task.id, []] as const;
            }
          })
        );

        const submissionMap = Object.fromEntries(submissionPairs) as Record<number, TugasSubmissionItem[]>;
        setSubmissionsByTask(submissionMap);

        setOpenSubmissionsByTask((prev) => {
          const next = { ...prev };
          rows.forEach((task) => {
            if (next[task.id] === undefined) {
              next[task.id] = (submissionMap[task.id]?.length || 0) > 0;
            }
          });
          return next;
        });
      } else {
        setSubmissionsByTask({});
        setOpenSubmissionsByTask({});
      }
    } catch (error) {
      console.error("Gagal memuat tugas pertemuan:", error);
      setItems([]);
      setSubmissionsByTask({});
      setOpenSubmissionsByTask({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pertemuanId, user?.id, user?.role]);

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pertemuanId || !user) return;

    setSubmitting(true);
    setMessage("");
    try {
      await createTugas({
        pertemuan_id: Number(pertemuanId),
        dosen_id: user.id,
        title,
        description,
        tanggal_upload: new Date().toISOString().slice(0, 10),
        deadline,
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      setMessage("Tugas berhasil diupload. OpenClaw langsung kirim notifikasi Telegram untuk tugas baru ini.");
      loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload tugas gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubmissions = (taskId: number) => {
    setOpenSubmissionsByTask((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/${user?.role}/matkul/${courseId}`)}
          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-slate-100">Tugas Pertemuan</h1>
      </div>

      {message ? (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-400">Memuat daftar tugas...</div>
      ) : isDosen ? (
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <section className="space-y-3">
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Panel Pengumpulan</p>
              <p className="mt-1 text-sm text-cyan-100">
                Fokus di sisi kiri untuk memantau siapa saja yang sudah submit, lengkap dengan file jawaban.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-400">
                Belum ada tugas di pertemuan ini.
              </div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-100">{item.title}</h2>
                      <p className="mt-1 text-xs text-cyan-300">
                        {item.course_name} • Pertemuan {item.pertemuan_ke}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{item.description || "Tanpa deskripsi"}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>Upload: {formatDate(item.tanggal_upload)}</p>
                      <p className="text-rose-300">Deadline: {formatDate(item.deadline)}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/55 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Pengumpulan Mahasiswa</p>
                        <p className="mt-1 text-sm text-slate-200">
                          {submissionsByTask[item.id]?.length || 0} mahasiswa sudah mengumpulkan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSubmissions(item.id)}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                      >
                        {openSubmissionsByTask[item.id] ? "Sembunyikan" : "Lihat Pengumpulan"}
                      </button>
                    </div>

                    {openSubmissionsByTask[item.id] ? (
                      <div className="mt-3 space-y-2">
                        {(submissionsByTask[item.id] || []).length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
                            Belum ada mahasiswa yang mengumpulkan untuk tugas ini.
                          </div>
                        ) : (
                          (submissionsByTask[item.id] || []).map((submission) => {
                            const fileUrl = toAbsoluteUploadUrl(submission.file_url);
                            return (
                              <article
                                key={`submission-${item.id}-${submission.id}`}
                                className="rounded-lg border border-slate-700/70 bg-slate-900/65 p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h3 className="text-sm font-semibold text-slate-100">{submission.mahasiswa_name}</h3>
                                  <p className="text-xs text-slate-400">Submit: {formatDateTime(submission.submitted_at)}</p>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {submission.mahasiswa_username ? (
                                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                                      @{submission.mahasiswa_username}
                                    </span>
                                  ) : null}
                                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                                    {submission.file_name}
                                  </span>
                                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                                    {formatFileSize(submission.file_size)}
                                  </span>
                                </div>

                                {fileUrl ? (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                                  >
                                    Buka File Pengumpulan
                                  </a>
                                ) : (
                                  <p className="mt-2 text-xs text-slate-500">File tidak tersedia</p>
                                )}
                              </article>
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <section className="rounded-2xl border border-indigo-500/30 bg-slate-900/75 p-5">
              <h2 className="text-lg font-bold text-indigo-300">Upload Tugas Dosen</h2>
              <p className="mt-1 text-sm text-slate-400">
                Area kanan khusus untuk membuat tugas baru, jadi panel pengumpulan di kiri tetap rapi dan tidak tercampur.
              </p>

              <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Judul tugas"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />

                <textarea
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Deskripsi tugas"
                  className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />

                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                >
                  {submitting ? "Mengupload..." : "Upload Tugas"}
                </button>
              </form>
            </section>
          </aside>
        </div>
      ) : (
        <div className="space-y-3">
          {isMahasiswa ? (
            <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-fuchsia-200">Panel Tugas Mahasiswa</p>
              <p className="mt-1 text-sm text-fuchsia-100">
                Pilih tugas lalu langsung masuk ke form pengumpulan. Tugas yang sudah dikumpulkan otomatis tidak ditampilkan lagi.
              </p>
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-400">
              Belum ada tugas di pertemuan ini.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 transition hover:border-fuchsia-400/35">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">{item.title}</h2>
                    <p className="mt-1 text-xs text-cyan-300">
                      {item.course_name} • Pertemuan {item.pertemuan_ke}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{item.description || "Tanpa deskripsi"}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Upload: {formatDate(item.tanggal_upload)}</p>
                    <p className="text-rose-300">Deadline: {formatDate(item.deadline)}</p>
                  </div>
                </div>

                {user?.role === "mahasiswa" ? (
                  <div className="mt-3">
                    <Link
                      to={`/mahasiswa/pengumpulan/${item.id}`}
                      className="inline-flex rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20"
                    >
                      Buka Form Pengumpulan →
                    </Link>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
