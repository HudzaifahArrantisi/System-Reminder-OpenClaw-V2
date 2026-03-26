export const API_URL = "http://localhost:5000/api";

export async function fetchCourses(role: string, userId: number) {
  const res = await fetch(`${API_URL}/courses?role=${role}&user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export async function fetchPertemuan(courseId: string) {
  const res = await fetch(`${API_URL}/courses/${courseId}/pertemuan`);
  if (!res.ok) throw new Error("Failed to fetch pertemuan");
  return res.json();
}

export async function fetchTugasByPertemuan(pertemuanId: string) {
  const res = await fetch(`${API_URL}/pertemuan/${pertemuanId}/tugas`);
  if (!res.ok) throw new Error("Failed to fetch tugas");
  return res.json();
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
