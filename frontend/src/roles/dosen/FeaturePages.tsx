import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';
import { RoleMatkulPage } from '../../shared/pages/MatkulPages';

export function DosenAbsensiPage() {
  return (
    <RoleFeaturePanel
      title="Buat Absensi"
      description="Dosen dapat generate QR code absensi dengan durasi sesi, input manual attendance, dan memantau statistik kehadiran real-time."
      highlights={[
        'Generate QR code per sesi',
        'Atur durasi buka/tutup absensi',
        'Mark attendance manual',
        'Statistik hadir/late/izin/alfa',
      ]}
    />
  );
}

export function DosenPenilaianPage() {
  return (
    <RoleFeaturePanel
      title="Penilaian"
      description="Fitur grading tugas mahasiswa skala 0-100 dengan filter per pertemuan, view submission, dan sorting berdasarkan nilai/nama."
      highlights={[
        'Input grade 0-100 dan feedback',
        'Filter submission per pertemuan',
        'Lihat jawaban dan lampiran mahasiswa',
        'Sort by grade atau nama mahasiswa',
      ]}
    />
  );
}

export function DosenMatkulPage() {
  return <RoleMatkulPage />;
}

export function DosenPesanPage() {
  return (
    <RoleFeaturePanel
      title="Pesan"
      description="Channel komunikasi dosen-mahasiswa untuk koordinasi kelas, pengumuman cepat, dan diskusi tugas."
      highlights={[
        'Thread pesan berdasarkan kelas',
        'Pesan broadcast ke mahasiswa',
        'Riwayat percakapan',
        'Notifikasi pesan baru',
      ]}
    />
  );
}
