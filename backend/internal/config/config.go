// Package config memuat konfigurasi aplikasi dari environment variables.
package config

import (
	"os"
)

// Config menyimpan semua konfigurasi yang dibutuhkan aplikasi.
type Config struct {
	DatabaseURL string
	Port        string
}

// Load membaca konfigurasi dari environment variables.
func Load() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Default to neon or empty
		dbURL = "postgresql://neondb_owner:npg_hOe3kmU6STpa@ep-purple-sky-a1277lk0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		DatabaseURL: dbURL,
		Port:        port,
	}
}
