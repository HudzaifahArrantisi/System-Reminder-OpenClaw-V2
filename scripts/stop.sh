#!/bin/bash
# stop.sh — Menghentikan semua service

echo "🛑 Menghentikan Tugas Reminder System..."
docker compose down
echo "✅ Semua service dihentikan."
