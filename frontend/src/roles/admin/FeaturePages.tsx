import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';

export function AdminPengumumanPage() {
  return (
    <RoleFeaturePanel
      title="Posting Pemberitahuan"
      description="Admin dapat membuat pengumuman system-wide beserta media agar informasi penting tersampaikan ke seluruh role."
      highlights={[
        'Create announcement dengan media',
        'Jadwal publish pengumuman',
        'Target audience by role',
        'Audit trail posting admin',
      ]}
    />
  );
}

export function AdminUktMonitoringPage() {
  return (
    <RoleFeaturePanel
      title="Pemantauan UKT"
      description="Pemantauan pembayaran UKT seluruh mahasiswa secara real-time, lengkap dengan detail transaksi per student."
      highlights={[
        'Status real-time setiap invoice',
        'Detail pembayaran per mahasiswa',
        'Filter berdasarkan fakultas/angkatan',
        'Rekonsiliasi payment webhook',
      ]}
    />
  );
}

export function AdminAkunPage() {
  return (
    <RoleFeaturePanel
      title="Kelola Akun"
      description="Manajemen akun pengguna lintas role: aktivasi, nonaktif, reset kredensial, dan pengaturan hak akses."
      highlights={[
        'Create dan update akun user',
        'Aktif/nonaktif akun',
        'Atur role-based access',
        'Reset password dan audit perubahan',
      ]}
    />
  );
}

export function AdminLaporanPage() {
  return (
    <RoleFeaturePanel
      title="Laporan Sistem"
      description="Laporan analitik sistem untuk melihat tren penggunaan, performa akademik, dan status pembayaran."
      highlights={[
        'Analytics penggunaan platform',
        'Kinerja akademik agregat',
        'Insight pembayaran UKT',
        'Export laporan periodik',
      ]}
    />
  );
}
