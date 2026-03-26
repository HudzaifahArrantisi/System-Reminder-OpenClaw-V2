DROP TABLE IF EXISTS notification_log CASCADE;
DROP TABLE IF EXISTS reminder CASCADE;
DROP TABLE IF EXISTS tugas CASCADE;
DROP TABLE IF EXISTS mahasiswa_matkul CASCADE;
DROP TABLE IF EXISTS pertemuan CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS matkul CASCADE;
DROP TABLE IF EXISTS mahasiswa CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('dosen', 'mahasiswa')),
  password VARCHAR(255) NOT NULL
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dosen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE pertemuan (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  pertemuan_ke INT NOT NULL
);

CREATE TABLE tugas (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  pertemuan_id INT NOT NULL REFERENCES pertemuan(id) ON DELETE CASCADE,
  dosen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tanggal_upload DATE NOT NULL,
  deadline DATE NOT NULL
);

-- Seed Minimal Data
INSERT INTO users (name, role, password) VALUES 
('Bapak Dosen', 'dosen', 'password'),
('Mahasiswa Budi', 'mahasiswa', 'password');

-- Course 1 for Dosen ID 1
INSERT INTO courses (name, dosen_id) VALUES 
('Rekayasa Perangkat Lunak', 1),
('Basis Data', 1),
('Jaringan Komputer', 1),
('Kecerdasan Buatan', 1),
('Pemrograman Web', 1),
('Struktur Data', 1),
('Matematika Diskrit', 1),
('Sistem Operasi', 1);

-- 16 Pertemuan untuk setiap course
DO $$
DECLARE
    cid INT;
    p INT;
BEGIN
    FOR cid IN 1..8 LOOP
        FOR p IN 1..16 LOOP
            INSERT INTO pertemuan (course_id, pertemuan_ke) VALUES (cid, p);
        END LOOP;
    END LOOP;
END $$;
