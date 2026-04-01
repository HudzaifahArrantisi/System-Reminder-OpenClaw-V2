export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_APP_API_URL ||
  "http://localhost:5000/api/v1";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

function getAccessToken() {
  try {
    const raw = localStorage.getItem("auth_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken || null;
  } catch {
    return null;
  }
}

function withAuthHeaders(headers: Record<string, string> = {}) {
  const token = getAccessToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

async function parseApiResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | T | null;

  if (!res.ok) {
    const message =
      (body as ApiEnvelope<T> | null)?.error?.message ||
      (body as { error?: string } | null)?.error ||
      fallbackMessage;
    throw new Error(message);
  }

  if (body && typeof body === "object" && "success" in body) {
    const envelope = body as ApiEnvelope<T>;
    return envelope.data as T;
  }

  return body as T;
}

export interface Course {
  id: number | string;
  name: string;
  dosen_id: number | string;
}

export interface Pertemuan {
  id: number;
  course_id: number | string;
  pertemuan_ke: number;
}

export interface TugasItem {
  id: number;
  course_id: number | string;
  pertemuan_id: number;
  dosen_id: number | string;
  title: string;
  description: string | null;
  tanggal_upload: string;
  deadline: string;
  course_name: string;
  pertemuan_ke: number;
  days_left?: number;
}

export interface ReminderItem {
  id: number;
  title: string;
  deadline: string;
  tanggal_upload: string;
  course_name: string;
  pertemuan_ke: number;
  status_code: "new" | "h3" | "h2" | "h1" | "h0";
  status_label: string;
  reminder_type: string | null;
  updated_at: string;
  source: string;
}

export interface FeedPost {
  id: number;
  role_creator: "ukm" | "ormawa" | "admin";
  user_id: number | null;
  title: string | null;
  caption: string;
  image_url: string | null;
  created_at: string;
  author_name: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface FeedComment {
  id: number;
  post_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user_name: string;
}

export async function fetchCourses(role: string, userId: number | string) {
  const res = await fetch(`${API_URL}/courses?role=${role}&user_id=${userId}`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<Course[]>(res, "Failed to fetch courses");
}

export async function fetchPertemuan(courseId: string) {
  const res = await fetch(`${API_URL}/courses/${courseId}/pertemuan`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<Pertemuan[]>(res, "Failed to fetch pertemuan");
}

export async function fetchTugasByPertemuan(
  pertemuanId: string,
  role?: string,
  userId?: number | string
) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (userId !== undefined && userId !== null) params.set("user_id", String(userId));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/pertemuan/${pertemuanId}/tugas${suffix}`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<TugasItem[]>(res, "Failed to fetch tugas");
}

export async function fetchTugas(role?: string, userId?: number | string) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (userId !== undefined && userId !== null) params.set("user_id", String(userId));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/tugas${suffix}`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<TugasItem[]>(res, "Failed to fetch tugas");
}

export async function fetchTugasReminders(role: string, userId: number | string) {
  const params = new URLSearchParams();
  params.set("role", role);
  params.set("user_id", String(userId));

  const res = await fetch(`${API_URL}/openclaw/task-status?${params.toString()}`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<ReminderItem[]>(res, "Failed to fetch reminder status");
}

export async function fetchFeedPosts(userId?: number | string) {
  const suffix = userId ? `?user_id=${encodeURIComponent(String(userId))}` : "";
  const res = await fetch(`${API_URL}/posts${suffix}`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<FeedPost[]>(res, "Failed to fetch posts");
}

export async function createFeedPost(payload: {
  role_creator: "ukm" | "ormawa" | "admin";
  user_id: number | string;
  title?: string;
  caption: string;
  image_url?: string;
}) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseApiResponse<FeedPost>(res, "Failed to create post");
}

export async function likeFeedPost(postId: number | string, userId: number | string) {
  const res = await fetch(`${API_URL}/posts/${postId}/likes`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ user_id: userId }),
  });
  await parseApiResponse<unknown>(res, "Failed to like post");
}

export async function unlikeFeedPost(postId: number | string, userId: number | string) {
  const res = await fetch(`${API_URL}/posts/${postId}/likes?user_id=${encodeURIComponent(String(userId))}`, {
    method: "DELETE",
    headers: withAuthHeaders(),
  });
  await parseApiResponse<unknown>(res, "Failed to unlike post");
}

export async function fetchPostComments(postId: number | string) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    headers: withAuthHeaders(),
  });
  return parseApiResponse<FeedComment[]>(res, "Failed to fetch comments");
}

export async function createPostComment(postId: number | string, userId: number | string, comment: string) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ user_id: userId, comment }),
  });
  return parseApiResponse<FeedComment>(res, "Failed to create comment");
}

export async function createTugas(payload: any) {
  const res = await fetch(`${API_URL}/tugas`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  return parseApiResponse<any>(res, "Failed to create tugas");
}

export async function submitTugas(tugasId: number | string, mahasiswaId: number | string, file: File) {
  const formData = new FormData();
  formData.append("mahasiswa_id", String(mahasiswaId));
  formData.append("file", file);

  const res = await fetch(`${API_URL}/tugas/${tugasId}/submit`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: formData,
  });
  return parseApiResponse<any>(res, "Failed to submit tugas");
}
