#!/bin/bash
# setup.sh — Menjalankan semua service dengan Docker Compose

echo "🚀 Memulai Tugas Reminder System..."
echo "=================================="

# Build dan jalankan semua service
docker compose up --build -d

echo ""
echo "✅ Semua service berjalan!"
echo ""
echo "📌 Akses:"
echo "   Frontend  : http://localhost:3000"
echo "   Backend   : http://localhost:8080"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "📋 Lihat logs: docker compose logs -f"
