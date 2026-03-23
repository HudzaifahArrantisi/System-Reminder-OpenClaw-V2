// Entry point untuk backend server.
// Menginisialisasi koneksi database, dependency injection, dan HTTP server.
package main

import (
	"context"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"tugas-reminder/backend/internal/config"
	"tugas-reminder/backend/internal/handler"
	"tugas-reminder/backend/internal/repository"
	"tugas-reminder/backend/internal/service"
)

func main() {
	// Load konfigurasi
	cfg := config.Load()

	// Koneksi ke PostgreSQL
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Gagal koneksi ke database: %v", err)
	}
	defer pool.Close()

	// Pastikan koneksi berjalan
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Database tidak merespons: %v", err)
	}
	log.Println("✅ Terhubung ke PostgreSQL")

	// Dependency injection
	repo := repository.NewTugasRepository(pool)
	svc := service.NewTugasService(repo)
	hdl := handler.NewTugasHandler(svc)

	// Setup Gin router
	r := gin.Default()

	// CORS middleware — izinkan frontend mengakses API
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: false,
	}))

	// Routes
	r.POST("/tugas", hdl.CreateTugas)
	r.GET("/tugas", hdl.GetAllTugas)

	// Jalankan server
	log.Printf("🚀 Server berjalan di port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
