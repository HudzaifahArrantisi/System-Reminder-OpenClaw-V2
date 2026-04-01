export type AppRole = 'mahasiswa' | 'dosen' | 'admin' | 'ortu' | 'ormawa' | 'ukm';

export interface NavItem {
  label: string;
  path: string;
}

export const ROLE_DEFAULT_PATH: Record<AppRole, string> = {
  mahasiswa: '/mahasiswa/dashboard',
  dosen: '/dosen/dashboard',
  admin: '/admin/dashboard',
  ormawa: '/ormawa/dashboard',
  ukm: '/ukm/dashboard',
  ortu: '/ortu/dashboard',
};

export const ROLE_NAVIGATION: Record<AppRole, NavItem[]> = {
  mahasiswa: [
    { label: 'Dashboard', path: '/mahasiswa/dashboard' },
    { label: 'Pembayaran UKT', path: '/mahasiswa/ukt' },
    { label: 'Scan Absensi', path: '/mahasiswa/absensi' },
    { label: 'Mata Kuliah', path: '/mahasiswa/matkul' },
    { label: 'Transkrip Nilai', path: '/mahasiswa/transkrip' },
    { label: 'Profil', path: '/mahasiswa/profil' },
  ],
  dosen: [
    { label: 'Dashboard', path: '/dosen/dashboard' },
    { label: 'Buat Absensi', path: '/dosen/absensi' },
    { label: 'Penilaian', path: '/dosen/penilaian' },
    { label: 'Kelola Matkul', path: '/dosen/matkul' },
    { label: 'Pesan', path: '/dosen/pesan' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Pemberitahuan', path: '/admin/pengumuman' },
    { label: 'Pemantauan UKT', path: '/admin/ukt-monitoring' },
    { label: 'Kelola Akun', path: '/admin/akun' },
    { label: 'Laporan Sistem', path: '/admin/laporan' },
  ],
  ortu: [
    { label: 'Dashboard', path: '/ortu/dashboard' },
    { label: 'Pantau Kehadiran', path: '/ortu/kehadiran' },
    { label: 'Status UKT', path: '/ortu/ukt' },
    { label: 'Nilai Akademik', path: '/ortu/nilai' },
  ],
  ormawa: [
    { label: 'Dashboard', path: '/ormawa/dashboard' },
    { label: 'Postingan', path: '/ormawa/postingan' },
    { label: 'Kelola Anggota', path: '/ormawa/anggota' },
    { label: 'Event', path: '/ormawa/event' },
    { label: 'Profile Setting', path: '/ormawa/pengaturan' },
  ],
  ukm: [
    { label: 'Dashboard', path: '/ukm/dashboard' },
    { label: 'Posting', path: '/ukm/postingan' },
    { label: 'Galeri', path: '/ukm/galeri' },
    { label: 'Anggota', path: '/ukm/anggota' },
    { label: 'Event', path: '/ukm/event' },
  ],
};
