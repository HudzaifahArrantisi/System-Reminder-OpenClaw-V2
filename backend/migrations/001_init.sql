-- ============================================
-- Migration 001: Initial Schema
-- Reminder Tugas E-Learning System
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nim             VARCHAR(20) UNIQUE NOT NULL,
    nama            TEXT NOT NULL,
    no_hp           VARCHAR(20),
    telegram_id     VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel mata kuliah
CREATE TABLE IF NOT EXISTS matkul (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_matkul     TEXT NOT NULL,
    kode_matkul     VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel relasi mahasiswa-matkul
CREATE TABLE IF NOT EXISTS mahasiswa_matkul (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id    UUID REFERENCES mahasiswa(id) ON DELETE CASCADE,
    matkul_id       UUID REFERENCES matkul(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (mahasiswa_id, matkul_id)
);

-- Tabel tugas
CREATE TABLE IF NOT EXISTS tugas (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matkul_id         UUID REFERENCES matkul(id) ON DELETE CASCADE,
    pertemuan         INT NOT NULL CHECK (pertemuan BETWEEN 1 AND 18),
    nama_tugas        TEXT NOT NULL,
    tanggal_dibuat    DATE NOT NULL,
    deadline          DATE NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel reminder (H-3, H-1, H0)
CREATE TABLE IF NOT EXISTS reminder (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tugas_id        UUID REFERENCES tugas(id) ON DELETE CASCADE,
    reminder_type   VARCHAR(10) NOT NULL,
    reminder_date   DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel log notifikasi
CREATE TABLE IF NOT EXISTS notification_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id    UUID REFERENCES mahasiswa(id) ON DELETE CASCADE,
    tugas_id        UUID REFERENCES tugas(id) ON DELETE CASCADE,
    reminder_type   VARCHAR(10),
    status          VARCHAR(20) DEFAULT 'pending',
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_tugas_deadline ON tugas(deadline);
CREATE INDEX IF NOT EXISTS idx_tugas_matkul_id ON tugas(matkul_id);
CREATE INDEX IF NOT EXISTS idx_reminder_date ON reminder(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminder_tugas_id ON reminder(tugas_id);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_tugas_id ON notification_log(tugas_id);
