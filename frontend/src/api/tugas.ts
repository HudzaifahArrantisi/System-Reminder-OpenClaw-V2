/**
 * API module untuk komunikasi dengan backend tugas.
 * Base URL mengarah ke backend service.
 */

// Dalam Docker, gunakan nama service; di local dev, gunakan localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

/** Tipe data Tugas sesuai kontrak API */
export interface Tugas {
  id: string;
  matkul: string;
  pertemuan: number;
  nama_tugas: string;
  tanggal_dibuat: string;
  deadline: string;
}

/** Payload untuk membuat tugas baru */
export interface CreateTugasPayload {
  matkul: string;
  pertemuan: number;
  nama_tugas: string;
  tanggal_dibuat: string;
  deadline: string;
}

/**
 * Mengambil semua data tugas dari backend.
 */
export async function getAllTugas(): Promise<Tugas[]> {
  const res = await fetch(`${API_BASE}/tugas`);
  if (!res.ok) throw new Error("Gagal mengambil data tugas");
  return res.json();
}

/**
 * Mengirim tugas baru ke backend.
 */
export async function createTugas(payload: CreateTugasPayload): Promise<Tugas> {
  const res = await fetch(`${API_BASE}/tugas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan tugas");
  return res.json();
}
