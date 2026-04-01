import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';

export function OrtuKehadiranPage() {
  return (
    <RoleFeaturePanel
      title="Pantau Kehadiran"
      description="Orang tua dapat memantau kehadiran anak secara real-time untuk hari ini dan melihat history lengkap."
      highlights={[
        'Ringkasan kehadiran harian',
        'History absensi lengkap',
        'Deteksi pola ketidakhadiran',
        'Notifikasi saat anak tidak hadir',
      ]}
    />
  );
}

export function OrtuUktPage() {
  return (
    <RoleFeaturePanel
      title="Pembayaran UKT Anak"
      description="Monitoring status pembayaran UKT anak: menunggu, diproses, berhasil, atau gagal."
      highlights={[
        'Status invoice UKT anak',
        'Riwayat pembayaran per semester',
        'Notifikasi jatuh tempo',
        'Bukti transaksi dan nominal',
      ]}
    />
  );
}

export function OrtuNilaiPage() {
  return (
    <RoleFeaturePanel
      title="Nilai Akademik"
      description="Akses transkrip nilai anak per semester untuk memantau progres akademik secara terstruktur."
      highlights={[
        'Transkrip nilai per semester',
        'Rata-rata nilai dan tren',
        'Detail nilai per mata kuliah',
        'Ringkasan performa akademik',
      ]}
    />
  );
}
