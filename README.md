# 🎓 OpenClaw E-Learning Task Reminder

![OpenClaw Banner](frontend/public/openclaw1.jpg)

Sistem pengelolaan tugas E-Learning yang cerdas dengan integrasi notifikasi otomatis ke **Telegram Bot**. Dirancang khusus untuk mempermudah **Dosen** memberikan tugas dan **Mahasiswa** memantau deadline secara tepat waktu.

---

## 🚀 Fitur Utama
- **Role-Based Portal**: Dashboard yang berbeda untuk Dosen dan Mahasiswa.
- **Dynamic Meeting Grid**: 16 Pertemuan per mata kuliah dengan manajemen tugas per pertemuan.
- **Instant Notification**: Notifikasi Telegram langsung terkirim begitu Dosen menekan tombol "Upload Tugas".
- **Intelligent Reminders**: Pengingat otomatis pada **H-3, H-2, H-1, dan H0 (hari deadline)** via OpenClaw Engine.
- **Duplicate Prevention**: Sistem `notification_log` untuk menjamin tidak ada pesan ganda yang masuk ke grup Telegram.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TailwindCSS + React Router.
- **Backend API**: Node.js + Express.js.
- **Database**: PostgreSQL (Neon Serverless).
- **Automation Service**: OpenClaw (Node.js Scheduler).
- **Notification**: Telegram Bot API.

---

## 📊 System Diagrams

### Use Case Diagram
```mermaid
useCaseDiagram
    actor Dosen
    actor Mahasiswa
    actor OpenClaw as "OpenClaw Scheduler"
    actor Telegram as "Telegram Bot"

    package "OpenClaw E-Learning System" {
        usecase UC1 as "Login Portal"
        usecase UC2 as "Pilih Matkul & Pertemuan"
        usecase UC3 as "Upload Tugas (Set Deadline)"
        usecase UC4 as "Lihat Tugas & Download Materi"
        usecase UC5 as "Upload Jawaban Tugas"
        usecase UC6 as "Kirim Notifikasi Instan"
        usecase UC7 as "Kirim Reminder (H-3 s/d H0)"
    }

    Dosen --> UC1
    Dosen --> UC2
    Dosen --> UC3
    
    UC3 ..> UC6 : <<include>>
    UC6 --> Telegram

    Mahasiswa --> UC1
    Mahasiswa --> UC2
    Mahasiswa --> UC4
    Mahasiswa --> UC5

    OpenClaw --> UC7
    UC7 --> Telegram
```

### System Flowchart
```mermaid
flowchart TD
    %% Actors
    D[Dosen]
    M[Mahasiswa]
    OC[OpenClaw Scheduler]
    TB[Telegram Bot]
    
    %% Components
    BE[Backend Node.js]
    DB[(PostgreSQL Neon)]
    
    %% Dosen Flow
    D -->|1. Login & Upload Tugas| BE
    BE -->|2. Simpan Data| DB
    BE -->|3. Kirim Notifikasi Instan| TB
    BE -->|4. Log Notifikasi H-0| DB
    
    %% OpenClaw Flow
    OC -->|5. Cek Tugas Berkala| DB
    DB -->|6. Kirim Data Tugas Aktif| OC
    OC -->|7. Hitung Selisih Hari| OC
    OC -->|8. Cek Notification Log| DB
    OC -->|9. Kirim Reminder H-3, H-2, H-1, H0| TB
    OC -->|10. Update Log Notifikasi| DB
    
    %% Mahasiswa Flow
    M -->|11. Login & Dashboard| BE
    BE -->|12. Fetch Tugas & Deadline| DB
    M -->|13. Submit Jawaban| BE
```

---

## 📂 Struktur Folder
```
Reminder/
├── backend-node/      # Express API Server (Port 5000)
├── frontend/          # React Dashboard UI (Port 5173)
├── openclaw/          # Automation & Scheduler Engine
├── .env               # Konfigurasi Token & DB URL (Global)
└── .gitignore         # File pengecualian Git
```

---

## ⚙️ Cara Menjalankan Project

### 1. Persiapan Environment
Pastikan file `.env` di folder root sudah terisi dengan benar:
```env
DATABASE_URL=postgres://... (Link Neon DB)
TELEGRAM_BOT_TOKEN=... (Token dari @BotFather)
TELEGRAM_CHANNEL_ID=... (ID Group/Channel Telegram)
```

### 2. Jalankan Backend (API Server)
Terminal 1:
```bash
cd backend-node
npm install
npm run start
```
*Server akan berjalan di http://localhost:5000*

### 3. Jalankan Frontend (Dashboard Web)
Terminal 2:
```bash
cd frontend
npm install
npm run dev
```
*Buka browser di http://localhost:5173*

### 4. Jalankan OpenClaw (Scheduler Reminder)
Terminal 3:
```bash
cd openclaw
npm install
npm start
```
*Engine ini akan memantau deadline database setiap jam.*

---

## 🧪 Cara Pengujian
1. **Login Dosen**: Gunakan nama `Bapak Dosen` dan password `password`.
2. **Pilih Matkul**: Klik kotak "Jaringan Komputer".
3. **Pilih Pertemuan**: Masuk ke "Pertemuan 2".
4. **Upload Tugas**: Isi form tugas.
   - Cek Telegram: Notifikasi **"Tugas Baru Diberikan"** harus muncul secara instan!
5. **Login Mahasiswa**: Gunakan nama `Mahasiswa Budi` dan password `password`.
   - Cek Dashboard: Angka "Tugas Mendekati Deadline" akan terupdate otomatis jika deadline h-3.
   - Cek Pertemuan 2: Tugas yang dibuat Dosen tadi akan muncul di sini.

---
