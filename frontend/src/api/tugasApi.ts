/**
 * API module — komunikasi dengan backend tugas & matkul.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ── Types ──

export interface Tugas {
  id: string;
  matkul_id: string;
  nama_matkul: string;
  kode_matkul: string;
  pertemuan: number;
  nama_tugas: string;
  tanggal_dibuat: string;
  deadline: string;
  created_at: string;
}

export interface CreateTugasPayload {
  matkul_id: string;
  pertemuan: number;
  nama_tugas: string;
  tanggal_dibuat: string;
  deadline: string;
}

export interface Matkul {
  id: string;
  nama_matkul: string;
  kode_matkul: string;
  created_at: string;
}

export interface CreateMatkulPayload {
  nama_matkul: string;
  kode_matkul: string;
}

// ── API Functions ──

export async function getAllTugas(): Promise<Tugas[]> {
  const res = await fetch(`${BASE_URL}/api/tugas`);
  if (!res.ok) throw new Error("Gagal mengambil data tugas");
  return res.json();
}

export async function getTugasById(id: string): Promise<Tugas> {
  const res = await fetch(`${BASE_URL}/api/tugas/${id}`);
  if (!res.ok) throw new Error("Tugas tidak ditemukan");
  return res.json();
}

export async function createTugas(payload: CreateTugasPayload): Promise<Tugas> {
  const res = await fetch(`${BASE_URL}/api/tugas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal menyimpan tugas" }));
    throw new Error(err.error || "Gagal menyimpan tugas");
  }
  return res.json();
}

export async function updateTugas(id: string, payload: CreateTugasPayload): Promise<Tugas> {
  const res = await fetch(`${BASE_URL}/api/tugas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal mengupdate tugas" }));
    throw new Error(err.error || "Gagal mengupdate tugas");
  }
  return res.json();
}

export async function deleteTugas(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/tugas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus tugas");
}

export async function getAllMatkul(): Promise<Matkul[]> {
  const res = await fetch(`${BASE_URL}/api/matkul`);
  if (!res.ok) throw new Error("Gagal mengambil data matkul");
  return res.json();
}

export async function createMatkul(payload: CreateMatkulPayload): Promise<Matkul> {
  const res = await fetch(`${BASE_URL}/api/matkul`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal menyimpan matkul" }));
    throw new Error(err.error || "Gagal menyimpan matkul");
  }
  return res.json();
}
