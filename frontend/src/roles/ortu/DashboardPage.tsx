import ActivityList from '../../shared/components/dashboard/ActivityList';
import DashboardHero from '../../shared/components/dashboard/DashboardHero';
import QuickActions from '../../shared/components/dashboard/QuickActions';
import StatCards from '../../shared/components/dashboard/StatCards';

const stats = [
  { label: 'Rata Kehadiran Anak', value: '89%', trend: 'Stabil selama 4 minggu', tone: 'emerald' as const },
  { label: 'Rata Nilai Anak', value: '3.52 / 4.00', trend: 'Naik +0.08 dari semester lalu', tone: 'indigo' as const },
  { label: 'Status UKT', value: 'Dalam Proses', trend: 'Verifikasi pembayaran 1x24 jam', tone: 'amber' as const },
];

export default function OrtuDashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero
        badge="Parent Monitoring"
        title="Pantau progres akademik anak secara menyeluruh"
        subtitle="Dashboard orang tua memberikan visibilitas kehadiran, performa nilai, dan status pembayaran UKT dalam satu tampilan yang mudah dipahami."
      />

      <StatCards items={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ActivityList
          title="Monitoring Mingguan"
          items={[
            'Anak hadir penuh pada 4 dari 5 hari kuliah minggu ini',
            'Nilai kuis basis data meningkat dari 78 ke 86',
            'Status UKT: pembayaran terdeteksi, menunggu konfirmasi',
            'Tidak ada peringatan akademik aktif',
          ]}
        />
        <QuickActions
          title="Aksi Cepat"
          items={[
            { label: 'Lihat Kehadiran', path: '/ortu/kehadiran' },
            { label: 'Cek Status UKT', path: '/ortu/ukt' },
            { label: 'Lihat Nilai Akademik', path: '/ortu/nilai' },
          ]}
        />
      </section>
    </div>
  );
}
