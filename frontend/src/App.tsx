import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import DashboardLayout from "./shared/components/DashboardLayout";
import ProtectedRoute from "./shared/routes/ProtectedRoute";
import RoleRoute from "./shared/routes/RoleRoute";
import { ROLE_DEFAULT_PATH } from "./shared/config/roleConfig";
import MahasiswaDashboardPage from "./roles/mahasiswa/DashboardPage";
import {
  MahasiswaAbsensiPage,
  MahasiswaMatkulPage,
  MahasiswaProfilPage,
  MahasiswaTranskripPage,
  MahasiswaUktPage,
} from "./roles/mahasiswa/FeaturePages";
import SubmissionFormPage from "./pages/SubmissionFormPage";
import DosenDashboardPage from "./roles/dosen/DashboardPage";
import { DosenAbsensiPage, DosenMatkulPage, DosenPenilaianPage, DosenPesanPage } from "./roles/dosen/FeaturePages";
import AdminDashboardPage from "./roles/admin/DashboardPage";
import { AdminAkunPage, AdminLaporanPage, AdminPengumumanPage, AdminUktMonitoringPage } from "./roles/admin/FeaturePages";
import OrtuDashboardPage from "./roles/ortu/DashboardPage";
import { OrtuKehadiranPage, OrtuNilaiPage, OrtuUktPage } from "./roles/ortu/FeaturePages";
import OrmawaDashboardPage from "./roles/ormawa/DashboardPage";
import { OrmawaAnggotaPage, OrmawaEventPage, OrmawaPengaturanPage, OrmawaPostinganPage } from "./roles/ormawa/FeaturePages";
import UkmDashboardPage from "./roles/ukm/DashboardPage";
import { UkmAnggotaPage, UkmEventPage, UkmGaleriPage, UkmPostinganPage } from "./roles/ukm/FeaturePages";
import { AcademicCalendarPage, CurriculumPage, PublicProfilePage, VisionMissionPage } from "./roles/public/PublicPages";
import { RoleCourseMeetingsPage, RolePertemuanTasksPage } from "./shared/pages/MatkulPages";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <span className="app-loading__mark">⬡</span>
        <span className="app-loading__text">OpenClaw</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={ROLE_DEFAULT_PATH[user.role]} replace /> : <Login />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />

        <Route path="/public/academic-calendar" element={<AcademicCalendarPage />} />
        <Route path="/public/curriculum" element={<CurriculumPage />} />
        <Route path="/public/visi-misi" element={<VisionMissionPage />} />
        <Route path="/public/profile/:username" element={<PublicProfilePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mahasiswa" element={<RoleRoute allow={["mahasiswa"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<MahasiswaDashboardPage />} />
              <Route path="ukt" element={<MahasiswaUktPage />} />
              <Route path="absensi" element={<MahasiswaAbsensiPage />} />
              <Route path="matkul" element={<MahasiswaMatkulPage />} />
              <Route path="matkul/:courseId" element={<RoleCourseMeetingsPage />} />
              <Route path="matkul/:courseId/pertemuan/:pertemuanId" element={<RolePertemuanTasksPage />} />
              <Route path="transkrip" element={<MahasiswaTranskripPage />} />
              <Route path="profil" element={<MahasiswaProfilPage />} />
              <Route path="pengumpulan/:tugasId" element={<SubmissionFormPage />} />
            </Route>
          </Route>

          <Route path="/dosen" element={<RoleRoute allow={["dosen"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<DosenDashboardPage />} />
              <Route path="absensi" element={<DosenAbsensiPage />} />
              <Route path="penilaian" element={<DosenPenilaianPage />} />
              <Route path="matkul" element={<DosenMatkulPage />} />
              <Route path="matkul/:courseId" element={<RoleCourseMeetingsPage />} />
              <Route path="matkul/:courseId/pertemuan/:pertemuanId" element={<RolePertemuanTasksPage />} />
              <Route path="pesan" element={<DosenPesanPage />} />
            </Route>
          </Route>

          <Route path="/admin" element={<RoleRoute allow={["admin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="pengumuman" element={<AdminPengumumanPage />} />
              <Route path="ukt-monitoring" element={<AdminUktMonitoringPage />} />
              <Route path="akun" element={<AdminAkunPage />} />
              <Route path="laporan" element={<AdminLaporanPage />} />
            </Route>
          </Route>

          <Route path="/ortu" element={<RoleRoute allow={["ortu"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<OrtuDashboardPage />} />
              <Route path="kehadiran" element={<OrtuKehadiranPage />} />
              <Route path="ukt" element={<OrtuUktPage />} />
              <Route path="nilai" element={<OrtuNilaiPage />} />
            </Route>
          </Route>

          <Route path="/ormawa" element={<RoleRoute allow={["ormawa"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<OrmawaDashboardPage />} />
              <Route path="postingan" element={<OrmawaPostinganPage />} />
              <Route path="anggota" element={<OrmawaAnggotaPage />} />
              <Route path="event" element={<OrmawaEventPage />} />
              <Route path="pengaturan" element={<OrmawaPengaturanPage />} />
            </Route>
          </Route>

          <Route path="/ukm" element={<RoleRoute allow={["ukm"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<UkmDashboardPage />} />
              <Route path="postingan" element={<UkmPostinganPage />} />
              <Route path="galeri" element={<UkmGaleriPage />} />
              <Route path="anggota" element={<UkmAnggotaPage />} />
              <Route path="event" element={<UkmEventPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}