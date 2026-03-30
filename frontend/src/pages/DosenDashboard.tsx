import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCourses, fetchTugas } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DosenDashboard() {
  const { user } = useAuth();
  const [totalTugas, setTotalTugas] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    if (!user) return;

    Promise.all([fetchTugas("dosen", user.id), fetchCourses("dosen", user.id)])
      .then(([tugas, courses]) => {
        setTotalTugas(tugas.filter((item) => item.dosen_id === user.id).length);
        setTotalCourses(courses.length);
        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        const dueSoon = tugas.filter((item) => {
          const dl = new Date(item.deadline);
          return dl >= now && dl <= next7Days;
        });
        setUpcoming(dueSoon.length);
      })
      .catch(console.error);
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-8 animate-fade-in-up">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Portal Dosen</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-100 to-blue-200 bg-clip-text text-transparent">
            Kelola Kelas, Tugas, dan Deadline
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Area ini khusus untuk dosen. Buat tugas baru per pertemuan, pantau beban tugas, dan kendalikan ritme kelas Anda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/dosen/courses"
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-900 font-semibold hover:bg-white transition-colors"
            >
              Buka Halaman Pertemuan
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total Mata Kuliah</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{totalCourses}</p>
        </article>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total Tugas Dibuat</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{totalTugas}</p>
        </article>
        <article className="glass-card p-5 border border-slate-700/70">
          <p className="text-xs uppercase tracking-widest text-slate-400">Deadline 7 Hari</p>
          <p className="mt-2 text-4xl font-black text-slate-100">{upcoming}</p>
        </article>
      </section>
    </div>
  );
}
