// Package service berisi logika bisnis aplikasi.
package service

import (
	"context"

	"tugas-reminder/backend/internal/model"
	"tugas-reminder/backend/internal/repository"
)

// TugasService menyediakan operasi bisnis untuk tugas.
type TugasService struct {
	repo *repository.TugasRepository
}

// NewTugasService membuat instance service baru.
func NewTugasService(repo *repository.TugasRepository) *TugasService {
	return &TugasService{repo: repo}
}

// CreateTugas membuat tugas baru.
func (s *TugasService) CreateTugas(ctx context.Context, req model.CreateTugasRequest) (*model.Tugas, error) {
	return s.repo.Create(ctx, req)
}

// GetAllTugas mengambil semua tugas.
func (s *TugasService) GetAllTugas(ctx context.Context) ([]model.Tugas, error) {
	return s.repo.GetAll(ctx)
}
