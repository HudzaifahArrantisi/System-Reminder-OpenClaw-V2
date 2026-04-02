export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_APP_API_URL ||
  "http://localhost:5000/api/v1";

const AUTH_SESSION_KEY = "auth_session";
const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type TokenPayloadShape = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
};

type AuthSessionShape = {
  user?: unknown;
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  tokens?: TokenPayloadShape;
  session?: AuthSessionShape;
};

type NormalizedAuthSession = {
  user: unknown;
  accessToken: string;
  refreshToken: string;
};

let refreshInFlight: Promise<boolean> | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function pickToken(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

function normalizeAuthSession(input: unknown): NormalizedAuthSession | null {
  const root = asRecord(input);
  if (!root) return null;

  const nestedSession = asRecord(root.session);
  const source = nestedSession ?? root;
  const tokens = asRecord(source.tokens) ?? asRecord(root.tokens);

  const accessToken = pickToken(
    source.accessToken,
    source.access_token,
    tokens?.accessToken,
    tokens?.access_token,
    root.accessToken,
    root.access_token
  );
  const refreshToken = pickToken(
    source.refreshToken,
    source.refresh_token,
    tokens?.refreshToken,
    tokens?.refresh_token,
    root.refreshToken,
    root.refresh_token
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    user: source.user ?? root.user ?? null,
    accessToken,
    refreshToken,
  };
}

function getAuthSession(): AuthSessionShape | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const normalized = normalizeAuthSession(parsed);
    if (!normalized) {
      return null;
    }

    const parsedRecord = asRecord(parsed);
    const shouldRewrite =
      !parsedRecord ||
      parsedRecord.accessToken !== normalized.accessToken ||
      parsedRecord.refreshToken !== normalized.refreshToken ||
      parsedRecord.user !== normalized.user;

    if (shouldRewrite) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return null;
  }
}

function saveAuthSession(session: NormalizedAuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}

function getAccessToken() {
  return getAuthSession()?.accessToken || null;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const currentSession = getAuthSession();
      const refreshToken = currentSession?.refreshToken;
      if (!refreshToken) {
        clearAuthSession();
        return false;
      }

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const body = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | unknown;
      if (!res.ok) {
        clearAuthSession();
        return false;
      }

      const payloadSource =
        body && typeof body === "object" && "success" in body
          ? (body as ApiEnvelope<unknown>).data
          : body;
      const payload = asRecord(payloadSource);
      const nextTokens = asRecord(payload?.tokens) ?? payload;
      const nextUser = payload?.user ?? currentSession?.user ?? null;
      const nextAccessToken = pickToken(nextTokens?.access_token, nextTokens?.accessToken);
      const nextRefreshToken = pickToken(nextTokens?.refresh_token, nextTokens?.refreshToken);

      if (!nextAccessToken || !nextRefreshToken) {
        clearAuthSession();
        return false;
      }

      saveAuthSession({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });

      return true;
    } catch {
      clearAuthSession();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function apiFetch(input: string, init: RequestInit = {}, allowRefresh = true): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(input, init, false);
    }
  }

  return res;
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

export interface TugasSubmissionItem {
  id: number;
  tugas_id: number;
  mahasiswa_id: string;
  mahasiswa_name: string;
  mahasiswa_username?: string | null;
  mahasiswa_email?: string | null;
  file_name: string;
  file_size?: number | null;
  file_type?: string | null;
  stored_path?: string | null;
  file_url?: string | null;
  submitted_at: string;
}

export interface TaskSubmissionPayload {
  task: {
    id: number;
    title: string;
    description: string | null;
    tanggal_upload: string;
    deadline: string;
    course_name: string;
    pertemuan_ke: number;
  };
  submissions: TugasSubmissionItem[];
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
  const res = await apiFetch(`${API_URL}/courses?role=${role}&user_id=${userId}`);
  return parseApiResponse<Course[]>(res, "Failed to fetch courses");
}

export async function fetchPertemuan(courseId: string) {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/pertemuan`);
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
  const res = await apiFetch(`${API_URL}/pertemuan/${pertemuanId}/tugas${suffix}`);
  return parseApiResponse<TugasItem[]>(res, "Failed to fetch tugas");
}

export async function fetchTaskSubmissions(taskId: number | string) {
  const res = await apiFetch(`${API_URL}/tasks/${taskId}/submissions`);
  return parseApiResponse<TaskSubmissionPayload>(res, "Failed to fetch task submissions");
}

export async function fetchTugas(role?: string, userId?: number | string) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (userId !== undefined && userId !== null) params.set("user_id", String(userId));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`${API_URL}/tugas${suffix}`);
  return parseApiResponse<TugasItem[]>(res, "Failed to fetch tugas");
}

export async function fetchTugasReminders(role: string, userId: number | string) {
  const params = new URLSearchParams();
  params.set("role", role);
  params.set("user_id", String(userId));

  const res = await apiFetch(`${API_URL}/openclaw/task-status?${params.toString()}`);
  return parseApiResponse<ReminderItem[]>(res, "Failed to fetch reminder status");
}

export async function fetchFeedPosts(userId?: number | string) {
  const suffix = userId ? `?user_id=${encodeURIComponent(String(userId))}` : "";
  const res = await apiFetch(`${API_URL}/posts${suffix}`);
  return parseApiResponse<FeedPost[]>(res, "Failed to fetch posts");
}

export async function createFeedPost(payload: {
  role_creator: "ukm" | "ormawa" | "admin";
  user_id: number | string;
  title?: string;
  caption: string;
  image_url?: string;
}) {
  const res = await apiFetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<FeedPost>(res, "Failed to create post");
}

export async function likeFeedPost(postId: number | string, userId: number | string) {
  const res = await apiFetch(`${API_URL}/posts/${postId}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  await parseApiResponse<unknown>(res, "Failed to like post");
}

export async function unlikeFeedPost(postId: number | string, userId: number | string) {
  const res = await apiFetch(`${API_URL}/posts/${postId}/likes?user_id=${encodeURIComponent(String(userId))}`, {
    method: "DELETE",
  });
  await parseApiResponse<unknown>(res, "Failed to unlike post");
}

export async function fetchPostComments(postId: number | string) {
  const res = await apiFetch(`${API_URL}/posts/${postId}/comments`);
  return parseApiResponse<FeedComment[]>(res, "Failed to fetch comments");
}

export async function createPostComment(postId: number | string, userId: number | string, comment: string) {
  const res = await apiFetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, comment }),
  });
  return parseApiResponse<FeedComment>(res, "Failed to create comment");
}

export async function createTugas(payload: any) {
  const res = await apiFetch(`${API_URL}/tugas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse<any>(res, "Failed to create tugas");
}

export async function submitTugas(tugasId: number | string, mahasiswaId: number | string, file: File) {
  const formData = new FormData();
  formData.append("mahasiswa_id", String(mahasiswaId));
  formData.append("file", file);

  const res = await apiFetch(`${API_URL}/tugas/${tugasId}/submit`, {
    method: "POST",
    body: formData,
  });
  return parseApiResponse<any>(res, "Failed to submit tugas");
}
