import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPertemuan } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [pertemuanList, setPertemuanList] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchPertemuan(courseId).then(setPertemuanList).catch(console.error);
    }
  }, [courseId]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to={`/${user?.role}/courses`}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-3xl font-bold">16 Pertemuan</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {pertemuanList.map((p) => (
          <Link 
            key={p.id}
            to={`/${user?.role}/pertemuan/${p.id}`}
            className="glass-card p-6 flex flex-col items-center justify-center hover:bg-slate-700/50 hover:border-indigo-500/50 transition-all gap-3"
          >
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400">
              {p.pertemuan_ke}
            </div>
            <span className="font-semibold text-slate-300">Pertemuan {p.pertemuan_ke}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
