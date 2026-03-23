# Tugas Reminder System

Sistem reminder tugas mahasiswa berbasis automation.

**Alur:** Frontend → Backend → PostgreSQL → OpenClaw → Telegram Bot → Mahasiswa

## Tech Stack

| Layer      | Teknologi                        |
|------------|----------------------------------|
| Frontend   | React + Vite + TypeScript + TailwindCSS |
| Backend    | Golang (Gin)                     |
| Database   | PostgreSQL                       |
| Automation | OpenClaw (Node.js)               |
| Bot        | Telegram Bot API                 |
| Infra      | Docker Compose                   |

## Cara Menjalankan

### 1. Setup Environment

Salin dan edit file `.env`:

```bash
cp .env.example .env
# Edit TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID
```

### 2. Jalankan dengan Docker

```bash
docker compose up --build -d
```

### 3. Akses Aplikasi

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080

### 4. Test

1. Buka http://localhost:3000
2. Isi form tugas (mata kuliah, pertemuan, nama tugas, tanggal, deadline)
3. Klik Submit
4. Data muncul di daftar tugas
5. OpenClaw otomatis mengirim reminder ke Telegram pada H-3, H-1, dan Hari H

### 5. Stop

```bash
docker compose down
```

## 📁 Struktur Folder

```
tugas-reminder/
├── docker-compose.yml
├── .env
├── backend/          # Golang REST API
├── openclaw/         # Node.js automation engine
├── frontend/         # React + Vite app
└── scripts/          # Setup & stop scripts
```

## API Endpoints

| Method | Path    | Deskripsi              |
|--------|---------|------------------------|
| POST   | /tugas  | Tambah tugas baru      |
| GET    | /tugas  | Ambil semua tugas      |
