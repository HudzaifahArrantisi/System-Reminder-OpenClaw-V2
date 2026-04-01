import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTugas, type TugasItem } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";

const formatDate = (dateValue: string) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function LatestTugasPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TugasItem[]>([]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchTugas("mahasiswa", user.id)
      .then((rows) => setItems(rows))
      .catch((error) => {
        console.error("Gagal memuat tugas terbaru dosen:", error);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const latestItems = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) =>
            new Date(b.tanggal_upload).getTime() - new Date(a.tanggal_upload).getTime() ||
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        .slice(0, 8),
    [items]
  );

  return (
    <aside className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-slate-100">Tugas Baru Dari Dosen</h3>
      <p className="mt-1 text-xs text-slate-400">Data tampil otomatis saat dosen upload tugas.</p>

      {loading ? (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-400">Memuat...</div>
      ) : latestItems.length === 0 ? (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-500">
          Belum ada tugas aktif.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {latestItems.map((item) => (
            <li key={`latest-${item.id}`}>
              <Link
                to={`/mahasiswa/pengumpulan/${item.id}`}
                className="block rounded-lg border border-slate-700/80 bg-slate-950/70 p-3 transition hover:border-cyan-400/35"
              >
                <p className="text-xs font-semibold text-slate-100 line-clamp-1">{item.title}</p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                  {item.course_name} • Pertemuan {item.pertemuan_ke}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Upload: {formatDate(item.tanggal_upload)} • Deadline: {formatDate(item.deadline)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
