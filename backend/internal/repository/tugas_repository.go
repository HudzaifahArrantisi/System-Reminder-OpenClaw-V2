// Package repository menangani akses data ke PostgreSQL untuk tugas.
package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"tugas-reminder/backend/internal/model"
)

// TugasRepository menyediakan operasi CRUD untuk tabel tugas & reminder.
type TugasRepository struct {
	db *pgxpool.Pool
}

// NewTugasRepository membuat instance repository baru.
func NewTugasRepository(db *pgxpool.Pool) *TugasRepository {
	return &TugasRepository{db: db}
}

// GetAll mengambil semua tugas (JOIN dengan matkul), ORDER BY deadline ASC.
func (r *TugasRepository) GetAll(ctx context.Context) ([]model.Tugas, error) {
	query := `
		SELECT 
			t.id, t.matkul_id, m.nama_matkul, COALESCE(m.kode_matkul, ''),
			t.pertemuan, t.nama_tugas, 
			t.tanggal_dibuat::text, t.deadline::text, t.created_at
		FROM tugas t
		JOIN matkul m ON m.id = t.matkul_id
		ORDER BY t.deadline ASC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tugas: %w", err)
	}
	defer rows.Close()

	var tugasList []model.Tugas
	for rows.Next() {
		var t model.Tugas
		if err := rows.Scan(
			&t.ID, &t.MatkulID, &t.NamaMatkul, &t.KodeMatkul,
			&t.Pertemuan, &t.NamaTugas,
			&t.TanggalDibuat, &t.Deadline, &t.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan tugas: %w", err)
		}
		tugasList = append(tugasList, t)
	}

	return tugasList, nil
}

// GetByID mengambil satu tugas berdasarkan ID.
func (r *TugasRepository) GetByID(ctx context.Context, id string) (*model.Tugas, error) {
	query := `
		SELECT 
			t.id, t.matkul_id, m.nama_matkul, COALESCE(m.kode_matkul, ''),
			t.pertemuan, t.nama_tugas,
			t.tanggal_dibuat::text, t.deadline::text, t.created_at
		FROM tugas t
		JOIN matkul m ON m.id = t.matkul_id
		WHERE t.id = $1`

	var t model.Tugas
	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.MatkulID, &t.NamaMatkul, &t.KodeMatkul,
		&t.Pertemuan, &t.NamaTugas,
		&t.TanggalDibuat, &t.Deadline, &t.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("tugas not found: %w", err)
	}

	return &t, nil
}

// Create menyimpan tugas baru + auto-generate 3 reminder (H-3, H-1, H0) dalam 1 transaksi.
func (r *TugasRepository) Create(ctx context.Context, req model.CreateTugasRequest) (*model.Tugas, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. INSERT tugas
	var tugas model.Tugas
	err = tx.QueryRow(ctx,
		`INSERT INTO tugas (matkul_id, pertemuan, nama_tugas, tanggal_dibuat, deadline)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, matkul_id, pertemuan, nama_tugas, tanggal_dibuat::text, deadline::text, created_at`,
		req.MatkulID, req.Pertemuan, req.NamaTugas, req.TanggalDibuat, req.Deadline,
	).Scan(&tugas.ID, &tugas.MatkulID, &tugas.Pertemuan, &tugas.NamaTugas,
		&tugas.TanggalDibuat, &tugas.Deadline, &tugas.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert tugas: %w", err)
	}

	// 2. Parse deadline dan generate reminder dates
	deadline, err := time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		return nil, fmt.Errorf("invalid deadline format: %w", err)
	}

	reminderTypes := []struct {
		Type string
		Days int
	}{
		{"H-3", -3},
		{"H-1", -1},
		{"H0", 0},
	}

	for _, rt := range reminderTypes {
		reminderDate := deadline.AddDate(0, 0, rt.Days).Format("2006-01-02")
		_, err = tx.Exec(ctx,
			`INSERT INTO reminder (tugas_id, reminder_type, reminder_date)
			 VALUES ($1, $2, $3)`,
			tugas.ID, rt.Type, reminderDate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert reminder %s: %w", rt.Type, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Fetch matkul info untuk response
	result, err := r.GetByID(ctx, tugas.ID)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// Update mengupdate tugas + hapus reminder lama + buat reminder baru.
func (r *TugasRepository) Update(ctx context.Context, id string, req model.CreateTugasRequest) (*model.Tugas, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. UPDATE tugas
	cmdTag, err := tx.Exec(ctx,
		`UPDATE tugas SET matkul_id=$1, pertemuan=$2, nama_tugas=$3, tanggal_dibuat=$4, deadline=$5
		 WHERE id=$6`,
		req.MatkulID, req.Pertemuan, req.NamaTugas, req.TanggalDibuat, req.Deadline, id,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update tugas: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return nil, fmt.Errorf("tugas with id %s not found", id)
	}

	// 2. Hapus reminder lama
	_, err = tx.Exec(ctx, `DELETE FROM reminder WHERE tugas_id = $1`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete old reminders: %w", err)
	}

	// 3. Generate reminder baru
	deadline, err := time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		return nil, fmt.Errorf("invalid deadline format: %w", err)
	}

	reminderTypes := []struct {
		Type string
		Days int
	}{
		{"H-3", -3},
		{"H-1", -1},
		{"H0", 0},
	}

	for _, rt := range reminderTypes {
		reminderDate := deadline.AddDate(0, 0, rt.Days).Format("2006-01-02")
		_, err = tx.Exec(ctx,
			`INSERT INTO reminder (tugas_id, reminder_type, reminder_date)
			 VALUES ($1, $2, $3)`,
			id, rt.Type, reminderDate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert reminder %s: %w", rt.Type, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return r.GetByID(ctx, id)
}

// Delete menghapus tugas berdasarkan ID (CASCADE akan hapus reminder juga).
func (r *TugasRepository) Delete(ctx context.Context, id string) error {
	cmdTag, err := r.db.Exec(ctx, `DELETE FROM tugas WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete tugas: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("tugas with id %s not found", id)
	}
	return nil
}

// GetPendingReminders mengambil semua reminder yang perlu dikirim hari ini
// dan belum pernah sukses terkirim.
func (r *TugasRepository) GetPendingReminders(ctx context.Context) ([]model.PendingReminder, error) {
	query := `
		SELECT 
			r.id as reminder_id,
			r.reminder_type,
			r.reminder_date::text,
			t.id as tugas_id,
			t.nama_tugas,
			t.deadline::text,
			t.pertemuan,
			m.nama_matkul,
			COALESCE(m.kode_matkul, '')
		FROM reminder r
		JOIN tugas t ON t.id = r.tugas_id
		JOIN matkul m ON m.id = t.matkul_id
		WHERE r.reminder_date = CURRENT_DATE
		AND NOT EXISTS (
			SELECT 1 FROM notification_log nl
			WHERE nl.tugas_id = t.id
			AND nl.reminder_type = r.reminder_type
			AND nl.status = 'success'
			AND DATE(nl.sent_at) = CURRENT_DATE
		)
		ORDER BY t.deadline ASC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query pending reminders: %w", err)
	}
	defer rows.Close()

	var reminders []model.PendingReminder
	for rows.Next() {
		var pr model.PendingReminder
		if err := rows.Scan(
			&pr.ReminderID, &pr.ReminderType, &pr.ReminderDate,
			&pr.TugasID, &pr.NamaTugas, &pr.Deadline,
			&pr.Pertemuan, &pr.NamaMatkul, &pr.KodeMatkul,
		); err != nil {
			return nil, fmt.Errorf("failed to scan pending reminder: %w", err)
		}
		reminders = append(reminders, pr)
	}

	return reminders, nil
}

// CreateNotificationLog mencatat hasil pengiriman notifikasi.
func (r *TugasRepository) CreateNotificationLog(ctx context.Context, req model.CreateNotificationLogRequest) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO notification_log (tugas_id, reminder_type, status, sent_at)
		 VALUES ($1, $2, $3, NOW())`,
		req.TugasID, req.ReminderType, req.Status,
	)
	if err != nil {
		return fmt.Errorf("failed to create notification log: %w", err)
	}
	return nil
}
