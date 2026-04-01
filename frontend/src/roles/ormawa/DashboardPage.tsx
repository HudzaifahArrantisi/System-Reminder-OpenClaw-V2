import Feed from '../../shared/components/Feed';
import ActivityList from '../../shared/components/dashboard/ActivityList';
import DashboardHero from '../../shared/components/dashboard/DashboardHero';
import QuickActions from '../../shared/components/dashboard/QuickActions';
import StatCards from '../../shared/components/dashboard/StatCards';

const stats = [
  { label: 'Total Anggota', value: '72', trend: '+6 anggota baru bulan ini', tone: 'emerald' as const },
  { label: 'Postingan', value: '133', trend: '9 konten dijadwalkan minggu ini', tone: 'indigo' as const },
  { label: 'Event Aktif', value: '4', trend: '2 event butuh approval', tone: 'amber' as const },
  { label: 'Followers', value: '1.2k', trend: 'Engagement +12% dibanding pekan lalu', tone: 'cyan' as const },
];

export default function OrmawaDashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero
        badge="ORMAWA Hub"
        title="Kelola organisasi dan event kampus lebih terarah"
        subtitle="Pantau performa konten, aktivitas anggota, dan progres event ORMAWA dari command center terintegrasi."
      />

      <StatCards items={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ActivityList
          title="Aktivitas ORMAWA"
          items={[
            'Publish posting briefing panitia Campus Expo',
            'Verifikasi 8 pendaftar anggota baru',
            'Finalisasi rundown event Leadership Talk',
            'Update banner profil organisasi untuk periode baru',
          ]}
        />
        <QuickActions
          title="Aksi Cepat ORMAWA"
          items={[
            { label: 'Buat Postingan', path: '/ormawa/postingan' },
            { label: 'Kelola Anggota', path: '/ormawa/anggota' },
            { label: 'Atur Event', path: '/ormawa/event' },
            { label: 'Update Profile Setting', path: '/ormawa/pengaturan' },
          ]}
        />
      </section>

      <Feed />
    </div>
  );
}
