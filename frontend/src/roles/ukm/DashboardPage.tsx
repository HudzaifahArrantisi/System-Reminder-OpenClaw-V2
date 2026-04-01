import Feed from '../../shared/components/Feed';
import ActivityList from '../../shared/components/dashboard/ActivityList';
import DashboardHero from '../../shared/components/dashboard/DashboardHero';
import QuickActions from '../../shared/components/dashboard/QuickActions';
import StatCards from '../../shared/components/dashboard/StatCards';

const stats = [
  { label: 'Postingan', value: '97', trend: '5 konten baru pekan ini', tone: 'indigo' as const },
  { label: 'Followers', value: '932', trend: '+41 follower baru', tone: 'cyan' as const },
  { label: 'Anggota', value: '45', trend: '3 anggota onboarding', tone: 'emerald' as const },
  { label: 'Event', value: '6', trend: '1 event akan dimulai besok', tone: 'amber' as const },
];

export default function UkmDashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero
        badge="UKM Activity Board"
        title="Bangun komunitas UKM dengan konten dan event yang konsisten"
        subtitle="Dashboard UKM membantu koordinasi anggota, publikasi galeri, dan manajemen event agar engagement komunitas terus meningkat."
      />

      <StatCards items={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ActivityList
          title="Agenda UKM"
          items={[
            'Publikasikan highlight latihan mingguan ke galeri',
            'Konfirmasi daftar hadir workshop internal',
            'Susun draft posting promosi event pekan depan',
            'Update struktur anggota per divisi teknis',
          ]}
        />
        <QuickActions
          title="Aksi Cepat UKM"
          items={[
            { label: 'Buat Postingan', path: '/ukm/postingan' },
            { label: 'Kelola Galeri', path: '/ukm/galeri' },
            { label: 'Kelola Anggota', path: '/ukm/anggota' },
            { label: 'Atur Event', path: '/ukm/event' },
          ]}
        />
      </section>

      <Feed />
    </div>
  );
}
