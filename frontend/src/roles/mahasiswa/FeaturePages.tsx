import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';
import { RoleMatkulPage } from '../../shared/pages/MatkulPages';

export function MahasiswaUktPage() {
  return (
    <RoleFeaturePanel
      title="Pembayaran UKT"
      description="Pembayaran UKT mahasiswa dengan QRIS/transfer, QR code dinamis, tracking status real-time, dan dukungan webhook notifikasi pembayaran berhasil/gagal."
      highlights={[
        'Generate QRIS dinamis per invoice',
        'Metode transfer bank dengan verifikasi otomatis',
        'Realtime payment status via webhook',
        'Riwayat transaksi dan bukti bayar',
      ]}
    />
  );
}

export function MahasiswaAbsensiPage() {
  return (
    <RoleFeaturePanel
      title="Scan Absensi"
      description="Mahasiswa bisa scan QR kehadiran, input manual sebagai fallback, filter berdasarkan hari, dan melihat history kehadiran lengkap."
      highlights={[
        'QR scanner untuk absensi per sesi',
        'Manual input code jika kamera gagal',
        'Filter history per hari/periode',
        'Status hadir, terlambat, izin, alfa',
      ]}
    />
  );
}

export function MahasiswaMatkulPage() {
  return <RoleMatkulPage />;
}

export function MahasiswaTranskripPage() {
  return (
    <RoleFeaturePanel
      title="Transkrip Nilai"
      description="Menampilkan history nilai lengkap lintas semester untuk memantau performa akademik secara transparan."
      highlights={[
        'Nilai per matkul dan semester',
        'Detail komponen nilai',
        'Indeks prestasi tiap semester',
        'Riwayat evaluasi akademik',
      ]}
    />
  );
}

export function MahasiswaProfilPage() {
  return (
    <RoleFeaturePanel
      title="Profil Mahasiswa"
      description="Mahasiswa dapat mengubah data pribadi secara mandiri untuk memastikan data akademik tetap akurat."
      highlights={[
        'Edit nama, kontak, alamat',
        'Update avatar profil',
        'Sinkronisasi data akun',
        'Validasi format data profil',
      ]}
    />
  );
}
