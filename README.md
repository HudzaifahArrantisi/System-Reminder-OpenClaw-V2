# 📚 Tugas Reminder System

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

## 🚀 Cara Menjalankan

### 1. Setup Environment

Salin dan edit file `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan isi:

```env
# PostgreSQL Neon — dapatkan dari dashboard Neon
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require&channel_binding=require

# Telegram Bot — dapatkan dari @BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHANNEL_ID=@nama_channel_kamu
```

### 3. Setup Database

Jalankan SQL migration di Neon Console atau psql:

```bash
psql $DATABASE_URL -f backend/migrations/001_init.sql
```

### 4. Buat Telegram Bot & Channel

#### Membuat Bot:
1. Buka [@BotFather](https://t.me/BotFather) di Telegram
2. Kirim `/newbot`
3. Ikuti instruksi, beri nama bot
4. Copy **API Token** yang diberikan → masukkan ke `TELEGRAM_BOT_TOKEN`

#### Membuat Channel:
1. Buat channel baru di Telegram
2. Jadikan bot sebagai **admin** channel
3. Jika channel publik: gunakan `@nama_channel` sebagai `TELEGRAM_CHANNEL_ID`
4. Jika channel private: gunakan chat ID (misal `-1001234567890`)

#### Cara mendapatkan Chat ID channel private:
1. Forward sebuah pesan dari channel ke [@userinfobot](https://t.me/userinfobot)
2. Bot akan mengembalikan chat ID

### 5. Jalankan

#### Dengan Docker (Recommended):

```bash
chmod +x scripts/setup.sh scripts/stop.sh
./scripts/setup.sh
```

#### Development Lokal (tanpa Docker):

**Backend:**
```bash
cd backend
go run ./cmd/server/main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**OpenClaw:**
```bash
cd openclaw
npm install
npm start
```

### 6. Akses Aplikasi

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

## API Endpoints

### Mata Kuliah

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/matkul` | Ambil semua matkul |
| POST | `/api/matkul` | Tambah matkul baru |

### Tugas

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/tugas` | Ambil semua tugas |
| GET | `/api/tugas/pending-reminders` | Ambil reminder pending hari ini |
| GET | `/api/tugas/:id` | Ambil tugas by ID |
| POST | `/api/tugas` | Tambah tugas baru + auto-generate 3 reminder |
| PUT | `/api/tugas/:id` | Update tugas + regenerate reminder |
| DELETE | `/api/tugas/:id` | Hapus tugas |

### Notification Log

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/notification-log` | Catat hasil pengiriman notifikasi |

## Tabel Database

| Tabel | Deskripsi |
|-------|-----------|
| `mahasiswa` | Data mahasiswa (NIM, nama, telegram_id) |
| `matkul` | Data mata kuliah |
| `mahasiswa_matkul` | Relasi many-to-many mahasiswa ↔ matkul |
| `tugas` | Data tugas (FK ke matkul, pertemuan 1-18) |
| `reminder` | 3 reminder per tugas: H-3, H-1, H0 |
| `notification_log` | Log hasil pengiriman notifikasi |

## Cara Test Manual Reminder

1. Tambahkan mata kuliah di frontend
2. Tambahkan tugas dengan **deadline = hari ini**
3. Cek endpoint pending reminders:
   ```bash
   curl http://localhost:8080/api/tugas/pending-reminders
   ```
4. Jalankan OpenClaw manual:
   ```bash
   cd openclaw && node -e "require('./ruleEngine').processReminders().then(r => console.log(r))"
   ```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Database connection failed | Pastikan `DATABASE_URL` benar, Neon project aktif |
| Telegram bot tidak mengirim | Pastikan bot sudah jadi admin channel |
| CORS error | Pastikan `CORS_ORIGIN` sesuai URL frontend |
| Reminder tidak terkirim | Cek `pending-reminders` endpoint, pastikan reminder_date = hari ini |
| Reminder terkirim duplikat | Tidak akan terjadi — query cek `notification_log` status = 'success' |

## License

MIT
