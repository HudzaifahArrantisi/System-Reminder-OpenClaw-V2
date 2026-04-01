import RoleFeaturePanel from '../../shared/components/RoleFeaturePanel';

export function UkmPostinganPage() {
  return (
    <RoleFeaturePanel
      title="Posting Konten"
      description="UKM dapat membuat konten text + media untuk promosi kegiatan dan update komunitas."
      highlights={[
        'Post konten ke feed bersama',
        'Dukungan upload media',
        'Atur visibilitas postingan',
        'Insight performa konten',
      ]}
    />
  );
}

export function UkmGaleriPage() {
  return (
    <RoleFeaturePanel
      title="Galeri"
      description="Manajemen galeri gambar UKM untuk dokumentasi aktivitas dan publikasi organisasi."
      highlights={[
        'Upload foto kegiatan',
        'Kelompokkan album',
        'Atur urutan tampilan',
        'Kurasi dokumentasi terbaik',
      ]}
    />
  );
}

export function UkmAnggotaPage() {
  return (
    <RoleFeaturePanel
      title="Anggota"
      description="Kelola data anggota UKM untuk administrasi organisasi dan koordinasi program kerja."
      highlights={[
        'Data anggota dan kontak',
        'Status keanggotaan',
        'Segmentasi per divisi',
        'Riwayat keikutsertaan event',
      ]}
    />
  );
}

export function UkmEventPage() {
  return (
    <RoleFeaturePanel
      title="Event UKM"
      description="Pembuatan dan pengelolaan event UKM dari perencanaan hingga pelaporan."
      highlights={[
        'Buat event dan jadwal',
        'Registrasi peserta',
        'Publikasi event ke feed',
        'Evaluasi hasil event',
      ]}
    />
  );
}
