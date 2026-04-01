INSERT INTO users (role_code, username, email, password_hash, full_name) VALUES
('admin', 'admin1', 'admin1@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'Admin Kampus'),
('dosen', 'dosen1', 'dosen1@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'Dr. Budi Santoso'),
('mahasiswa', 'mhs1', 'mhs1@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'Siti Aminah'),
('mahasiswa', 'mhs2', 'mhs2@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'Rizky Pratama'),
('ortu', 'ortu1', 'ortu1@keluarga.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'Ibu Siti'),
('ukm', 'ukmrobotik', 'ukm.robotik@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'UKM Robotik'),
('ormawa', 'bem', 'bem@kampus.ac.id', '$2b$10$KIsAxqG7NqU3/eDxk18LFOZhnqJGm5WmS6fYVCdF6Sm8KUkY0qZOS', 'BEM Kampus')
ON CONFLICT (username) DO UPDATE SET
	role_code = EXCLUDED.role_code,
	email = EXCLUDED.email,
	password_hash = EXCLUDED.password_hash,
	full_name = EXCLUDED.full_name,
	is_active = true,
	deleted_at = NULL;

INSERT INTO mahasiswa_profiles (user_id, nim, program_studi, fakultas, angkatan, phone)
SELECT id, '20260001', 'Informatika', 'FTI', 2026, '08123456789' FROM users WHERE username = 'mhs1'
ON CONFLICT (nim) DO NOTHING;

INSERT INTO mahasiswa_profiles (user_id, nim, program_studi, fakultas, angkatan, phone)
SELECT id, '20260002', 'Informatika', 'FTI', 2026, '08129876543' FROM users WHERE username = 'mhs2'
ON CONFLICT (nim) DO NOTHING;

INSERT INTO dosen_profiles (user_id, nidn, fakultas, bidang_keahlian, phone)
SELECT id, '0123456789', 'FTI', 'Web Engineering', '081212121212' FROM users WHERE username = 'dosen1'
ON CONFLICT (nidn) DO NOTHING;

INSERT INTO admin_profiles (user_id, job_title, unit_kerja, phone)
SELECT id, 'Super Admin', 'IT Kampus', '081211111111' FROM users WHERE username = 'admin1'
ON CONFLICT DO NOTHING;

INSERT INTO ortu_profiles (user_id, occupation, phone, address)
SELECT id, 'Wiraswasta', '081233344455', 'Jakarta' FROM users WHERE username = 'ortu1'
ON CONFLICT DO NOTHING;

INSERT INTO ukm_profiles (user_id, org_name, category, description)
SELECT id, 'UKM Robotik', 'Teknologi', 'Komunitas robotik kampus' FROM users WHERE username = 'ukmrobotik'
ON CONFLICT DO NOTHING;

INSERT INTO ormawa_profiles (user_id, org_name, category, description)
SELECT id, 'BEM Kampus', 'Pemerintahan Mahasiswa', 'Organisasi eksekutif mahasiswa' FROM users WHERE username = 'bem'
ON CONFLICT DO NOTHING;

INSERT INTO ortu_student_links (ortu_user_id, mahasiswa_user_id, relation_type, is_primary)
SELECT p.id, s.id, 'parent', true
FROM users p
JOIN users s ON s.username = 'mhs1'
WHERE p.username = 'ortu1'
ON CONFLICT (ortu_user_id, mahasiswa_user_id) DO NOTHING;

INSERT INTO courses (code, name, lecturer_user_id, semester, academic_year, credits)
SELECT 'IF101', 'Rekayasa Perangkat Lunak', u.id, 2, '2026/2027', 3
FROM users u
WHERE u.username = 'dosen1'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_enrollments (course_id, student_user_id, status)
SELECT c.id, s.id, 'active'
FROM courses c
JOIN users s ON s.username IN ('mhs1', 'mhs2')
WHERE c.code = 'IF101'
ON CONFLICT (course_id, student_user_id) DO NOTHING;

INSERT INTO course_meetings (course_id, meeting_no, title, scheduled_at, topic)
SELECT c.id, 1, 'Pengantar RPL', now() + interval '1 day', 'SDLC dan Agile'
FROM courses c
WHERE c.code = 'IF101'
ON CONFLICT (course_id, meeting_no) DO NOTHING;

INSERT INTO learning_contents (course_id, meeting_id, author_user_id, content_type, title, description, published_at)
SELECT c.id, m.id, d.id, 'material', 'Slide Minggu 1', 'Materi pengantar RPL', now()
FROM courses c
JOIN course_meetings m ON m.course_id = c.id AND m.meeting_no = 1
JOIN users d ON d.username = 'dosen1'
WHERE c.code = 'IF101';

INSERT INTO learning_contents (course_id, meeting_id, author_user_id, content_type, title, description, due_at, max_score, published_at)
SELECT c.id, m.id, d.id, 'task', 'Tugas 1 - Analisis Kebutuhan', 'Kumpulkan dokumen requirement', now() + interval '7 day', 100, now()
FROM courses c
JOIN course_meetings m ON m.course_id = c.id AND m.meeting_no = 1
JOIN users d ON d.username = 'dosen1'
WHERE c.code = 'IF101';

INSERT INTO task_submissions (task_content_id, student_user_id, submission_text, file_url, status, submitted_at)
SELECT t.id, s.id, 'Dokumen terlampir', 'https://cdn.example.com/submissions/mhs1-t1.pdf', 'submitted', now()
FROM learning_contents t
JOIN users s ON s.username = 'mhs1'
WHERE t.content_type = 'task' AND t.title = 'Tugas 1 - Analisis Kebutuhan'
ON CONFLICT (task_content_id, student_user_id) DO NOTHING;

INSERT INTO task_grades (submission_id, grader_user_id, score, feedback, graded_at)
SELECT sub.id, d.id, 88.5, 'Analisis baik, lengkapi use-case diagram', now()
FROM task_submissions sub
JOIN users d ON d.username = 'dosen1'
ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO attendance_sessions (course_id, meeting_id, lecturer_user_id, session_code, qr_token, opens_at, closes_at, status)
SELECT c.id, m.id, d.id, 'ATT-IF101-M1', 'QR-IF101-M1', now(), now() + interval '2 hour', 'open'
FROM courses c
JOIN course_meetings m ON m.course_id = c.id AND m.meeting_no = 1
JOIN users d ON d.username = 'dosen1'
WHERE c.code = 'IF101'
ON CONFLICT (session_code) DO NOTHING;

INSERT INTO attendance_records (session_id, student_user_id, attendance_status, scanned_at)
SELECT s.id, u.id, 'present', now()
FROM attendance_sessions s
JOIN users u ON u.username = 'mhs1'
WHERE s.session_code = 'ATT-IF101-M1'
ON CONFLICT (session_id, student_user_id) DO NOTHING;

INSERT INTO posts (author_user_id, title, body)
SELECT u.id, 'Pengumuman Kampus', 'Kuliah umum nasional dilaksanakan Jumat depan.'
FROM users u WHERE u.username = 'admin1';

INSERT INTO ukt_invoices (invoice_number, student_user_id, issued_by_user_id, term, amount_due, amount_paid, status, issued_at, due_at)
SELECT 'INV-2026-0001', s.id, a.id, '2026-Ganjil', 4500000, 0, 'pending', now(), now() + interval '30 day'
FROM users s, users a
WHERE s.username = 'mhs1' AND a.username = 'admin1'
ON CONFLICT (invoice_number) DO NOTHING;
