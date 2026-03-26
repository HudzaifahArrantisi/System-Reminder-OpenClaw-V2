// Entry point untuk backend server.
// Menginisialisasi koneksi database, dependency injection, dan HTTP server.
package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"tugas-reminder/backend/internal/config"
	"tugas-reminder/backend/internal/handler"
	"tugas-reminder/backend/internal/repository"
	"tugas-reminder/backend/internal/service"
)

func main() {
	// Load .env file jika ada (untuk development)
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	// Load konfigurasi
	cfg := config.Load()

	// Koneksi ke PostgreSQL (Neon)
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Gagal koneksi ke database: %v", err)
	}
	defer pool.Close()

	// Pastikan koneksi berjalan
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("❌ Database tidak merespons: %v", err)
	}
	log.Println("✅ Terhubung ke PostgreSQL (Neon)")

	// Dependency injection
	tugasRepo := repository.NewTugasRepository(pool)
	matkulRepo := repository.NewMatkulRepository(pool)
	tugasSvc := service.NewTugasService(tugasRepo)
	tugasHdl := handler.NewTugasHandler(tugasSvc)
	matkulHdl := handler.NewMatkulHandler(matkulRepo)

	// Setup Gin router
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin, "http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
	}))

	// ── Routes ──

	// Matkul routes
	r.GET("/api/matkul", matkulHdl.GetAllMatkul)
	r.POST("/api/matkul", matkulHdl.CreateMatkul)

	// Tugas routes — PENTING: /pending-reminders harus SEBELUM /:id
	r.GET("/api/tugas", tugasHdl.GetAllTugas)
	r.GET("/api/tugas/pending-reminders", tugasHdl.GetPendingReminders)
	r.GET("/api/tugas/:id", tugasHdl.GetTugasByID)
	r.POST("/api/tugas", tugasHdl.CreateTugas)
	r.PUT("/api/tugas/:id", tugasHdl.UpdateTugas)
	r.DELETE("/api/tugas/:id", tugasHdl.DeleteTugas)

	// Notification log route (dipanggil oleh OpenClaw)
	r.POST("/api/notification-log", tugasHdl.CreateNotificationLog)

	// Jalankan server
	log.Printf("🚀 Server berjalan di port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("❌ Gagal menjalankan server: %v", err)
	}
}
