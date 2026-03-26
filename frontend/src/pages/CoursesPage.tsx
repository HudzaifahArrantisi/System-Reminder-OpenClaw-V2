import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCourses } from "../api/client";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchCourses(user.role, user.id).then(setCourses).catch(console.error);
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mata Kuliah</h1>
      <p className="text-slate-400 mb-8">Daftar mata kuliah yang Anda akses.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Link 
            key={c.id} 
            to={`/${user?.role}/courses/${c.id}`}
            className="glass-card p-6 block hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl mb-4">
              {c.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{c.name}</h3>
            <p className="text-slate-400 mt-2 text-sm">Lihat 16 Pertemuan &rightarrow;</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
