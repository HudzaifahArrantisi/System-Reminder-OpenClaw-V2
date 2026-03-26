// Package config memuat konfigurasi aplikasi dari environment variables.
package config

import "os"

// Config menyimpan semua konfigurasi aplikasi.
type Config struct {
	DatabaseURL string
	Port        string
	CORSOrigin  string
}

// Load membaca konfigurasi dari environment variables.
func Load() *Config {
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}

	return &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		Port:        port,
		CORSOrigin:  corsOrigin,
	}
}