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

// CreateTugas membuat tugas baru (beserta 3 reminder).
func (s *TugasService) CreateTugas(ctx context.Context, req model.CreateTugasRequest) (*model.Tugas, error) {
	return s.repo.Create(ctx, req)
}

// GetAllTugas mengambil semua tugas.
func (s *TugasService) GetAllTugas(ctx context.Context) ([]model.Tugas, error) {
	return s.repo.GetAll(ctx)
}

// GetTugasByID mengambil tugas berdasarkan ID.
func (s *TugasService) GetTugasByID(ctx context.Context, id string) (*model.Tugas, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateTugas mengupdate tugas dan me-regenerate reminder.
func (s *TugasService) UpdateTugas(ctx context.Context, id string, req model.CreateTugasRequest) (*model.Tugas, error) {
	return s.repo.Update(ctx, id, req)
}

// DeleteTugas menghapus tugas.
func (s *TugasService) DeleteTugas(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

// GetPendingReminders mengambil reminder yang perlu dikirim hari ini.
func (s *TugasService) GetPendingReminders(ctx context.Context) ([]model.PendingReminder, error) {
	return s.repo.GetPendingReminders(ctx)
}

// CreateNotificationLog mencatat hasil pengiriman notifikasi.
func (s *TugasService) CreateNotificationLog(ctx context.Context, req model.CreateNotificationLogRequest) error {
	return s.repo.CreateNotificationLog(ctx, req)
}
