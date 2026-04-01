import type { Role } from '../context/AuthContext';

export interface RoleRouteItem {
  path: string;
  label: string;
  roles: Role[];
}

export const roleRouteMap: RoleRouteItem[] = [
  { path: '/mahasiswa/dashboard', label: 'Dashboard Mahasiswa', roles: ['mahasiswa'] },
  { path: '/mahasiswa/courses', label: 'Mata Kuliah Mahasiswa', roles: ['mahasiswa'] },
  { path: '/mahasiswa/attendance/scan', label: 'Scan Absensi', roles: ['mahasiswa'] },
  { path: '/mahasiswa/ukt/invoices', label: 'Invoice UKT', roles: ['mahasiswa'] },
  { path: '/dosen/dashboard', label: 'Dashboard Dosen', roles: ['dosen'] },
  { path: '/dosen/courses', label: 'Kelola Course', roles: ['dosen'] },
  { path: '/dosen/attendance/sessions', label: 'Sesi Absensi', roles: ['dosen'] },
  { path: '/admin/dashboard', label: 'Dashboard Admin', roles: ['admin'] },
  { path: '/admin/ukt-monitoring', label: 'Monitoring UKT', roles: ['admin'] },
  { path: '/ortu/dashboard', label: 'Dashboard Orang Tua', roles: ['ortu'] },
  { path: '/ortu/children', label: 'Pantau Anak', roles: ['ortu'] },
  { path: '/ukm/dashboard', label: 'Dashboard UKM', roles: ['ukm'] },
  { path: '/ukm/posts', label: 'Posting UKM', roles: ['ukm'] },
  { path: '/ormawa/dashboard', label: 'Dashboard ORMAWA', roles: ['ormawa'] },
  { path: '/ormawa/posts', label: 'Posting ORMAWA', roles: ['ormawa'] },
];
