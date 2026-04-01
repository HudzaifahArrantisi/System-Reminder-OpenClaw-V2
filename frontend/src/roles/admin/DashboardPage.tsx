import Feed from '../../shared/components/Feed';
import ActivityList from '../../shared/components/dashboard/ActivityList';
import DashboardHero from '../../shared/components/dashboard/DashboardHero';
import QuickActions from '../../shared/components/dashboard/QuickActions';
import StatCards from '../../shared/components/dashboard/StatCards';

const stats = [
  { label: 'Total Mahasiswa', value: '3.210', trend: '+84 akun baru bulan ini', tone: 'indigo' as const },
  { label: 'Total Dosen', value: '312', trend: '+7 dosen aktif semester ini', tone: 'cyan' as const },
  { label: 'UKT Belum Bayar', value: '487', trend: 'Perlu follow-up 152 akun', tone: 'rose' as const },
  { label: 'UKM/Ormawa Aktif', value: '54', trend: '9 event terjadwal pekan ini', tone: 'emerald' as const },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero
        badge="Admin Control Tower"
        title="Pantau operasi kampus secara real-time"
        subtitle="Manajemen akun, pembayaran UKT, dan distribusi informasi sistem-wide sekarang terpusat dalam satu dashboard eksekutif."
      />

      <StatCards items={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ActivityList
          title="Prioritas Operasional"
          items={[
            'Review transaksi UKT gagal webhook dan lakukan rekonsiliasi',
            'Publikasikan pengumuman maintenance sistem malam ini',
            'Audit role access untuk akun baru fakultas FTI',
            'Generate laporan analitik mingguan untuk pimpinan',
          ]}
        />
        <QuickActions
          title="Aksi Cepat Admin"
          items={[
            { label: 'Buat Pengumuman', path: '/admin/pengumuman' },
            { label: 'Monitor Pembayaran UKT', path: '/admin/ukt-monitoring' },
            { label: 'Kelola Akun User', path: '/admin/akun' },
            { label: 'Lihat Laporan Sistem', path: '/admin/laporan' },
          ]}
        />
      </section>
      <Feed />
    </div>
  );
}
