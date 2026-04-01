import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';

export function OrmawaPostinganPage() {
  return (
    <RoleFeaturePanel
      title="Buat Postingan"
      description="ORMAWA dapat membuat posting text + media dan langsung auto-post ke feed bersama."
      highlights={[
        'Post text, image, dan media',
        'Auto-publish ke unified feed',
        'Scheduling konten kegiatan',
        'Tracking engagement posting',
      ]}
    />
  );
}

export function OrmawaAnggotaPage() {
  return (
    <RoleFeaturePanel
      title="Kelola Anggota"
      description="Manajemen data anggota ORMAWA untuk memudahkan koordinasi kepanitiaan dan divisi."
      highlights={[
        'Tambah/hapus anggota',
        'Pengelompokan per divisi',
        'Status anggota aktif/nonaktif',
        'Riwayat perubahan struktur',
      ]}
    />
  );
}

export function OrmawaEventPage() {
  return (
    <RoleFeaturePanel
      title="Event Management"
      description="Perencanaan dan pengelolaan event ORMAWA dari tahap pembuatan hingga evaluasi pelaksanaan."
      highlights={[
        'Create event dan timeline',
        'Kelola peserta dan panitia',
        'Publish event ke feed',
        'Laporan pasca-event',
      ]}
    />
  );
}

export function OrmawaPengaturanPage() {
  return (
    <RoleFeaturePanel
      title="Profile Setting"
      description="Pengaturan profil ORMAWA meliputi logo, banner, dan deskripsi organisasi."
      highlights={[
        'Upload logo organisasi',
        'Update banner kegiatan',
        'Edit deskripsi dan kontak',
        'Atur identitas visual ORMAWA',
      ]}
    />
  );
}
