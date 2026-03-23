-- =========================================
-- EXTENSION
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- TABEL MAHASISWA
-- =========================================
CREATE TABLE IF NOT EXISTS mahasiswa (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nim             VARCHAR(20) UNIQUE NOT NULL,
    nama            TEXT NOT NULL,
    no_hp           VARCHAR(20), -- untuk WA
    telegram_id     VARCHAR(50), -- untuk bot telegram
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABEL MATA KULIAH
-- =========================================
CREATE TABLE IF NOT EXISTS matkul (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_matkul     TEXT NOT NULL,
    kode_matkul     VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- RELASI MAHASISWA - MATKUL (ENROLLMENT)
-- =========================================
CREATE TABLE IF NOT EXISTS mahasiswa_matkul (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id    UUID REFERENCES mahasiswa(id) ON DELETE CASCADE,
    matkul_id       UUID REFERENCES matkul(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (mahasiswa_id, matkul_id)
);

-- =========================================
-- TABEL TUGAS
-- =========================================
CREATE TABLE IF NOT EXISTS tugas (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matkul_id         UUID REFERENCES matkul(id) ON DELETE CASCADE,
    pertemuan         INT NOT NULL CHECK (pertemuan BETWEEN 1 AND 18),
    nama_tugas        TEXT NOT NULL,
    tanggal_dibuat    DATE NOT NULL,
    deadline          DATE NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABEL REMINDER (UNTUK OPENCLAW)
-- =========================================
CREATE TABLE IF NOT EXISTS reminder (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tugas_id        UUID REFERENCES tugas(id) ON DELETE CASCADE,
    reminder_type   VARCHAR(10) NOT NULL, -- H-3, H-1, H0
    reminder_date   DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABEL LOG PENGIRIMAN NOTIFIKASI
-- =========================================
CREATE TABLE IF NOT EXISTS notification_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id    UUID REFERENCES mahasiswa(id) ON DELETE CASCADE,
    tugas_id        UUID REFERENCES tugas(id) ON DELETE CASCADE,
    reminder_type   VARCHAR(10),
    status          VARCHAR(20) DEFAULT 'pending', -- success / failed
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INDEX (BIAR CEPAT)
-- =========================================
CREATE INDEX idx_tugas_deadline ON tugas(deadline);
CREATE INDEX idx_reminder_date ON reminder(reminder_date);
CREATE INDEX idx_notification_status ON notification_log(status);