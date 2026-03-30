import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import PertemuanDetail from "./pages/PertemuanDetail";
import DosenDashboard from "./pages/DosenDashboard.tsx";
import MahasiswaDashboard from "./pages/MahasiswaDashboard.tsx";
import SubmissionFormPage from "./pages/SubmissionFormPage.tsx";
import { useAuth } from "./context/AuthContext";

function RoleRoute({ role, children }: { role: "dosen" | "mahasiswa"; children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading session...</div>;
  }

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
          <Route path="/dosen" element={<RoleRoute role="dosen"><DosenDashboard /></RoleRoute>} />
          <Route path="/dosen/courses" element={<RoleRoute role="dosen"><CoursesPage /></RoleRoute>} />
          <Route path="/dosen/courses/:courseId" element={<RoleRoute role="dosen"><CourseDetail /></RoleRoute>} />
          <Route path="/dosen/pertemuan/:pertemuanId" element={<RoleRoute role="dosen"><PertemuanDetail /></RoleRoute>} />
          
          {/* MAHASISWA ROUTES */}
          <Route path="/mahasiswa" element={<RoleRoute role="mahasiswa"><MahasiswaDashboard /></RoleRoute>} />
          <Route path="/mahasiswa/courses" element={<RoleRoute role="mahasiswa"><CoursesPage /></RoleRoute>} />
          <Route path="/mahasiswa/courses/:courseId" element={<RoleRoute role="mahasiswa"><CourseDetail /></RoleRoute>} />
          <Route path="/mahasiswa/pertemuan/:pertemuanId" element={<RoleRoute role="mahasiswa"><PertemuanDetail /></RoleRoute>} />
          <Route path="/mahasiswa/pengumpulan/:tugasId" element={<RoleRoute role="mahasiswa"><SubmissionFormPage /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
