import Feed from '../../shared/components/Feed';
import ActivityList from '../../shared/components/dashboard/ActivityList';
import DashboardHero from '../../shared/components/dashboard/DashboardHero';
import QuickActions from '../../shared/components/dashboard/QuickActions';
import StatCards from '../../shared/components/dashboard/StatCards';

const stats = [
  { label: 'Matkul Diampu', value: '6', trend: 'Semester aktif: 2026 Genap', tone: 'indigo' as const },
  { label: 'Mahasiswa Bimbingan', value: '124', trend: '18 mahasiswa TA aktif', tone: 'cyan' as const },
  { label: 'Tugas Perlu Dinilai', value: '39', trend: '13 tugas overdue review', tone: 'amber' as const },
  { label: 'Sesi Absensi Aktif', value: '2', trend: '1 sesi tutup dalam 20 menit', tone: 'emerald' as const },
];

export default function DosenDashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero
        badge="Dosen Command Center"
        title="Kontrol kelas dan evaluasi dalam satu panel"
        subtitle="Dari absensi QR real-time sampai grading terstruktur, seluruh aktivitas pengajaran bisa dipantau dari dashboard ini."
      />

      <StatCards items={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ActivityList
          title="Worklist Mengajar Hari Ini"
          items={[
            'Finalisasi QR absensi untuk kelas IF101 pertemuan 8',
            'Review 12 submission tugas RPL dan input nilai',
            'Upload materi tambahan sebelum kelas malam',
            'Balas pesan mahasiswa terkait revisi tugas',
          ]}
        />
        <QuickActions
          title="Aksi Cepat Dosen"
          items={[
            { label: 'Buat Sesi Absensi', path: '/dosen/absensi' },
            { label: 'Mulai Penilaian', path: '/dosen/penilaian' },
            { label: 'Kelola Mata Kuliah', path: '/dosen/matkul' },
            { label: 'Buka Pesan Mahasiswa', path: '/dosen/pesan' },
          ]}
        />
      </section>
      <Feed />
    </div>
  );
}
