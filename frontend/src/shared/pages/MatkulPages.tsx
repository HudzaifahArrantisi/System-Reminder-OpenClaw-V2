import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createTugas,
  fetchCourses,
  fetchPertemuan,
  fetchTugasByPertemuan,
  type Course,
  type Pertemuan,
  type TugasItem,
} from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const COURSE_SLOTS = 8;
const MEETING_SLOTS = 16;
const FIXED_COURSE_NAMES = [
  "Rekayasa Perangkat Lunak",
  "Basis Data",
  "Jaringan Komputer",
  "Kecerdasan Buatan",
  "Pemrograman Web",
  "Struktur Data",
  "Matematika Diskrit",
  "Sistem Operasi",
];

const normalizeCourseName = (value: string) => value.trim().toLowerCase();

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

  const slots = useMemo(
    () => {
      const byName = new Map(courses.map((item) => [normalizeCourseName(item.name), item]));
      const usedCourseIds = new Set<string | number>();

      return FIXED_COURSE_NAMES.slice(0, COURSE_SLOTS).map((expectedName, index) => {
        let selected = byName.get(normalizeCourseName(expectedName)) || null;

        if (!selected) {
          selected = courses.find((item) => !usedCourseIds.has(item.id)) || null;
        }

        if (selected) {
          usedCourseIds.add(selected.id);
        }

        return {
          slot: index + 1,
          expectedName,
          course: selected,
        };
      });
    },
    [courses]
  );

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-slate-100">8 Mata Kuliah</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pilih salah satu mata kuliah untuk melihat 16 pertemuan.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-400">Memuat mata kuliah...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {slots.map(({ slot, expectedName, course }) =>
            course ? (
              <Link
                key={`course-${course.id}`}
                to={`/${user?.role}/matkul/${course.id}`}
                className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 transition hover:border-cyan-400/35 hover:-translate-y-0.5"
              >
                <p className="text-xs uppercase tracking-widest text-cyan-300">Matkul {slot}</p>
                <h2 className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{expectedName}</h2>
                <p className="mt-2 text-xs text-slate-400">Buka 16 pertemuan</p>
              </Link>
            ) : (
              <div
                key={`course-empty-${slot}`}
                className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4"
              >
                <p className="text-xs uppercase tracking-widest text-slate-500">Matkul {slot}</p>
                <h2 className="mt-2 text-base font-semibold text-slate-400 line-clamp-2">{expectedName}</h2>
                <p className="mt-2 text-xs text-slate-500">Belum tersinkron ke database</p>
              </div>
            )
          )}
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<TugasItem[]>([]);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const loadData = () => {
    if (!pertemuanId || !user) return;

    setLoading(true);
    fetchTugasByPertemuan(pertemuanId, user.role, user.id)
      .then((rows) => setItems(rows))
      .catch((error) => {
        console.error("Gagal memuat tugas pertemuan:", error);
        setItems([]);
      })
      .finally(() => setLoading(false));
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
      ) : (
        <div className="space-y-3">
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
                      Buka Form Pengumpulan
                    </Link>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      )}

      {user?.role === "dosen" ? (
        <section className="rounded-2xl border border-indigo-500/30 bg-slate-900/75 p-5">
          <h2 className="text-lg font-bold text-indigo-300">Upload Tugas Dosen</h2>
          <p className="mt-1 text-sm text-slate-400">
            Setelah upload, tugas langsung masuk dashboard mahasiswa dan trigger notifikasi OpenClaw Telegram.
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
      ) : null}
    </section>
  );
}
