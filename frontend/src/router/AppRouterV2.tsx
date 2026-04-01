import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import MahasiswaDashboard from '../pages/MahasiswaDashboard';
import DosenDashboard from '../pages/DosenDashboard';
import CoursesPage from '../pages/CoursesPage';
import RolePlaceholderPage from '../pages/RolePlaceholderPage';
import ProtectedRoute from '../guards/ProtectedRoute';
import RoleGuard from '../guards/RoleGuard';

export default function AppRouterV2() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={['mahasiswa']} />}>
            <Route path="/mahasiswa/dashboard" element={<MahasiswaDashboard />} />
            <Route path="/mahasiswa/courses" element={<CoursesPage />} />
            <Route
              path="/mahasiswa/attendance/scan"
              element={<RolePlaceholderPage title="Scan Absensi" description="Halaman scan absensi mahasiswa." />}
            />
            <Route
              path="/mahasiswa/ukt/invoices"
              element={<RolePlaceholderPage title="Invoice UKT" description="Daftar invoice UKT mahasiswa." />}
            />
          </Route>

          <Route element={<RoleGuard allow={['dosen']} />}>
            <Route path="/dosen/dashboard" element={<DosenDashboard />} />
            <Route path="/dosen/courses" element={<CoursesPage />} />
            <Route
              path="/dosen/attendance/sessions"
              element={<RolePlaceholderPage title="Sesi Absensi" description="Kelola sesi absensi untuk dosen." />}
            />
          </Route>

          <Route element={<RoleGuard allow={['admin']} />}>
            <Route
              path="/admin/dashboard"
              element={<RolePlaceholderPage title="Dashboard Admin" description="Ringkasan monitoring sistem dan UKT." />}
            />
            <Route
              path="/admin/ukt-monitoring"
              element={<RolePlaceholderPage title="Monitoring UKT" description="Pemantauan invoice UKT dan pembayaran." />}
            />
          </Route>

          <Route element={<RoleGuard allow={['ortu']} />}>
            <Route
              path="/ortu/dashboard"
              element={<RolePlaceholderPage title="Dashboard Orang Tua" description="Pantau kehadiran dan UKT anak." />}
            />
            <Route
              path="/ortu/children"
              element={<RolePlaceholderPage title="Data Anak" description="Detail anak yang terhubung ke akun orang tua." />}
            />
          </Route>

          <Route element={<RoleGuard allow={['ukm']} />}>
            <Route
              path="/ukm/dashboard"
              element={<RolePlaceholderPage title="Dashboard UKM" description="Ringkasan aktivitas UKM." />}
            />
            <Route
              path="/ukm/posts"
              element={<RolePlaceholderPage title="Posting UKM" description="Kelola posting kegiatan UKM." />}
            />
          </Route>

          <Route element={<RoleGuard allow={['ormawa']} />}>
            <Route
              path="/ormawa/dashboard"
              element={<RolePlaceholderPage title="Dashboard ORMAWA" description="Ringkasan aktivitas ORMAWA." />}
            />
            <Route
              path="/ormawa/posts"
              element={<RolePlaceholderPage title="Posting ORMAWA" description="Kelola posting ORMAWA." />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
