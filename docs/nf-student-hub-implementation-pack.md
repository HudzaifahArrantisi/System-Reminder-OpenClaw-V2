# NF Student Hub Implementation Pack

Dokumen ini berisi paket implementasi praktis untuk menyetarakan flow fitur project target dengan NF Student Hub.

## 1. Migration Order (Neon PostgreSQL)

Jalankan file SQL ini berurutan:

1. `backend-node/database/migrations/001_extensions_enums.sql`
2. `backend-node/database/migrations/002_roles_users_profiles.sql`
3. `backend-node/database/migrations/003_academic_core.sql`
4. `backend-node/database/migrations/004_attendance.sql`
5. `backend-node/database/migrations/005_feed.sql`
6. `backend-node/database/migrations/006_finance.sql`
7. `backend-node/database/migrations/007_notification_logs.sql`
8. `backend-node/database/migrations/099_updated_at_triggers.sql`
9. Seed minimal: `backend-node/database/seeds/001_seed_minimal_multirole.sql`

Command helper:

- `npm run migrate:new`
- `npm run seed:new`

## 2. Mapping Legacy -> New PostgreSQL

- users -> users
- mahasiswa -> mahasiswa_profiles
- dosen -> dosen_profiles
- admin -> admin_profiles
- ortu -> ortu_profiles
- ukm -> ukm_profiles
- ormawa -> ormawa_profiles
- posts -> posts
- likes -> post_likes
- comments -> post_comments
- mata_kuliah/courses -> courses
- mahasiswa_mata_kuliah -> course_enrollments
- pertemuan -> course_meetings
- tugas + materi -> learning_contents (content_type: task/material)
- submissions -> task_submissions
- penilaian -> task_grades
- attendance_sessions -> attendance_sessions
- attendance -> attendance_records
- ukt_invoices -> ukt_invoices

## 3. Data Type Migration Rules

- Primary key: UUID (`gen_random_uuid()`).
- Waktu: `TIMESTAMPTZ`.
- Enum MySQL: PostgreSQL enum type.
- Soft delete: `deleted_at TIMESTAMPTZ NULL` pada entitas bisnis.
- `updated_at` otomatis: trigger `set_updated_at()`.

## 4. Mandatory Index Coverage

- users(email), users(role_code), users(username)
- posts(created_at, author_user_id)
- post_comments(post_id)
- post_likes(post_id, user_id) unique
- ukt_invoices(student_user_id, status)
- attendance_records(student_user_id, session_id)
- task_submissions(task_content_id, student_user_id) unique
- learning_contents(due_at) untuk tugas aktif

## 5. Backend Modular Structure (Express)

- `backend-node/src/modules/*/*.routes.js`
- `backend-node/src/modules/*/*.controller.js`
- `backend-node/src/modules/*/*.service.js`
- `backend-node/src/modules/*/*.repository.js`
- `backend-node/src/middlewares/authenticate.js`
- `backend-node/src/middlewares/authorizeRoles.js`
- `backend-node/src/middlewares/errorHandler.js`
- `backend-node/src/app.js`
- `backend-node/src/server.js`

## 6. Frontend RBAC Template

Template yang sudah ditambahkan:

- `frontend/src/guards/ProtectedRoute.tsx`
- `frontend/src/guards/RoleGuard.tsx`
- `frontend/src/router/AppRouterV2.tsx`
- `frontend/src/router/roleRouteMap.ts`

Catatan: Router lama tidak diganti agar aplikasi tetap stabil selama transisi.

## 7. QA/UAT Checklist

### Login & RBAC

- Semua role dapat login.
- Route role lain ditolak (HTTP 403/redirect).
- Public profile dapat diakses tanpa login.

### Feed

- Admin/UKM/ORMAWA dapat create/update/delete posting.
- Semua role login dapat like dan komentar.
- Like duplikat ditolak.

### Akademik

- Dosen dapat create course/meeting/material/task.
- Mahasiswa dapat submit task sekali per task.
- Dosen dapat memberi nilai.

### Absensi

- Dosen dapat buat sesi absensi.
- Mahasiswa scan dalam sesi open.
- Duplikasi attendance ditolak.

### UKT

- Admin create invoice.
- Mahasiswa/ortu lihat invoice.
- Pembayaran mengubah status invoice.

## 8. Deployment Strategy (Simple)

- Frontend: Vercel/Netlify.
- Backend API: Render/Railway/Fly.
- Worker reminder: service terpisah.
- Neon: branch dev/staging/prod.
- Migrasi DB: hanya via pipeline release dengan approval.
