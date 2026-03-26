import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import PertemuanDetail from "./pages/PertemuanDetail";
import { useAuth } from "./context/AuthContext";

const DosenDashboard = () => {
  const { user } = useAuth();
  const [totalTugas, setTotalTugas] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/tugas")
      .then(res => res.json())
      .then(data => {
        const dosenTugas = data.filter((t: any) => t.dosen_id === user?.id);
        setTotalTugas(dosenTugas.length);
      })
      .catch(console.error);
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Dosen Overview</h1>
      <p className="text-slate-400 text-lg">Selamat datang di portal Dosen. Gunakan menu Pertemuan untuk mengelola tugas.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
          <h3 className="text-lg font-bold text-white mb-2">Statistik Tugas</h3>
          <p className="text-4xl font-bold text-indigo-400">{totalTugas}</p>
          <p className="text-sm text-slate-500 mt-2">Total tugas yang telah Anda berikan di seluruh mata kuliah</p>
        </div>
      </div>
    </div>
  );
};

const MahasiswaDashboard = () => {
  const [tugasDekat, setTugasDekat] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/tugas")
      .then(res => res.json())
      .then(data => {
        // Cek tugas yang deadline-nya h-3 sampai H0
        let dekatCount = 0;
        const today = new Date();
        today.setHours(0,0,0,0);
        
        data.forEach((t: any) => {
          const dl = new Date(t.deadline);
          dl.setHours(0,0,0,0);
          const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 3) {
            dekatCount++;
          }
        });
        setTugasDekat(dekatCount);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Mahasiswa Overview</h1>
      <p className="text-slate-400 text-lg">Selamat datang di portal Mahasiswa. Pantau tugas-tugas Anda sebelum deadline!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <h3 className="text-lg font-bold text-white mb-2">Tugas Mendekati Deadline (H-3)</h3>
          <p className="text-4xl font-bold text-red-400">{tugasDekat}</p>
          <p className="text-sm text-slate-500 mt-2">Segera kerjakan dan kumpulkan di menu pertemuan!</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/auth" />
          } 
        />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          {/* DOSEN ROUTES */}
          <Route path="/dosen" element={<DosenDashboard />} />
          <Route path="/dosen/courses" element={<CoursesPage />} />
          <Route path="/dosen/courses/:courseId" element={<CourseDetail />} />
          <Route path="/dosen/pertemuan/:pertemuanId" element={<PertemuanDetail />} />
          
          {/* MAHASISWA ROUTES */}
          <Route path="/mahasiswa" element={<MahasiswaDashboard />} />
          <Route path="/mahasiswa/courses" element={<CoursesPage />} />
          <Route path="/mahasiswa/courses/:courseId" element={<CourseDetail />} />
          <Route path="/mahasiswa/pertemuan/:pertemuanId" element={<PertemuanDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
