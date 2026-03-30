export const API_URL = "http://localhost:5000/api";

export interface Course {
  id: number;
  name: string;
  dosen_id: number;
}

export interface Pertemuan {
  id: number;
  course_id: number;
  pertemuan_ke: number;
}

export interface TugasItem {
  id: number;
  course_id: number;
  pertemuan_id: number;
  dosen_id: number;
  title: string;
  description: string | null;
  tanggal_upload: string;
  deadline: string;
  course_name: string;
  pertemuan_ke: number;
  days_left?: number;
}

export async function fetchCourses(role: string, userId: number) {
  const res = await fetch(`${API_URL}/courses?role=${role}&user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json() as Promise<Course[]>;
}

export async function fetchPertemuan(courseId: string) {
  const res = await fetch(`${API_URL}/courses/${courseId}/pertemuan`);
  if (!res.ok) throw new Error("Failed to fetch pertemuan");
  return res.json() as Promise<Pertemuan[]>;
}

export async function fetchTugasByPertemuan(
  pertemuanId: string,
  role?: string,
  userId?: number
) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (userId) params.set("user_id", String(userId));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/pertemuan/${pertemuanId}/tugas${suffix}`);
  if (!res.ok) throw new Error("Failed to fetch tugas");
  return res.json() as Promise<TugasItem[]>;
}

export async function fetchTugas(role?: string, userId?: number) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (userId) params.set("user_id", String(userId));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/tugas${suffix}`);
  if (!res.ok) throw new Error("Failed to fetch tugas");
  return res.json() as Promise<TugasItem[]>;
}

export async function createTugas(payload: any) {
  const res = await fetch(`${API_URL}/tugas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create tugas");
  return res.json();
}

export async function submitTugas(tugasId: number, mahasiswaId: number, file: File) {
  const formData = new FormData();
  formData.append("mahasiswa_id", String(mahasiswaId));
  formData.append("file", file);

  const res = await fetch(`${API_URL}/tugas/${tugasId}/submit`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to submit tugas");
  }

  return res.json();
}
