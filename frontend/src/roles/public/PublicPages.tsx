import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';

export function AcademicCalendarPage() {
  return (
    <RoleFeaturePanel
      title="Academic Calendar"
      description="Informasi kalender akademik kampus untuk jadwal kuliah, UTS/UAS, dan agenda resmi lainnya."
      highlights={[
        'Timeline semester berjalan',
        'Tanggal penting akademik',
        'Periode registrasi dan yudisium',
        'Sinkronisasi agenda kampus',
      ]}
    />
  );
}

export function CurriculumPage() {
  return (
    <RoleFeaturePanel
      title="Curriculum"
      description="Informasi struktur kurikulum tiap program studi agar publik memahami peta pembelajaran kampus."
      highlights={[
        'Daftar mata kuliah per semester',
        'Capaian pembelajaran',
        'Prasyarat mata kuliah',
        'Roadmap akademik program studi',
      ]}
    />
  );
}

export function VisionMissionPage() {
  return (
    <RoleFeaturePanel
      title="Visi Misi"
      description="Halaman publik visi dan misi institusi sebagai acuan nilai, arah, dan target strategis kampus."
      highlights={[
        'Visi institusi',
        'Misi jangka menengah dan panjang',
        'Nilai inti kampus',
        'Sasaran pengembangan pendidikan',
      ]}
    />
  );
}

export function PublicProfilePage() {
  return (
    <RoleFeaturePanel
      title="Public Profile"
      description="Profil publik untuk menampilkan informasi dasar akun organisasi atau pengguna yang dapat diakses tanpa login."
      highlights={[
        'Informasi profil singkat',
        'Riwayat kontribusi/aktivitas publik',
        'Kontak publik terverifikasi',
        'Identitas visual organisasi',
      ]}
    />
  );
}
