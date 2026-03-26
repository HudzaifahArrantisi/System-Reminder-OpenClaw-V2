#!/bin/bash
set -e

echo "=========================================="
echo " 🚀 Setting up Reminder System"
echo "=========================================="

# 1. Cek & buat .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "⚠️  PENTING: Edit .env dan isi kredensial Anda:"
    echo "   - DATABASE_URL (Neon PostgreSQL)"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo "   - TELEGRAM_CHANNEL_ID"
    echo ""
    echo "Jalankan script ini lagi setelah mengisi .env"
    exit 0
fi

echo "✅ .env file found"

# 2. Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# 3. Install openclaw dependencies
echo ""
echo "📦 Installing OpenClaw dependencies..."
cd openclaw && npm install && cd ..

# 4. Build & run dengan Docker Compose
echo ""
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "=========================================="
echo " ✅ Setup Complete!"
echo "=========================================="
echo ""
echo " Frontend : http://localhost:5173"
echo " Backend  : http://localhost:8080"
echo " OpenClaw : Running in background"
echo ""
echo " 📋 Langkah selanjutnya:"
echo " 1. Buka http://localhost:5173"
echo " 2. Tambahkan mata kuliah"
echo " 3. Tambahkan tugas dengan deadline"
echo " 4. Reminder otomatis akan dikirim ke Telegram!"
echo ""
