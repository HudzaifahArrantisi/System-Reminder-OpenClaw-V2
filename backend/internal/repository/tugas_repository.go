// Package repository menangani akses data ke PostgreSQL.
package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"tugas-reminder/backend/internal/model"
)

// TugasRepository menyediakan operasi CRUD untuk tabel tugas.
type TugasRepository struct {
	db *pgxpool.Pool
}

// NewTugasRepository membuat instance repository baru.
func NewTugasRepository(db *pgxpool.Pool) *TugasRepository {
	return &TugasRepository{db: db}
}

// Create menyimpan tugas baru ke database dan mengembalikan ID-nya.
func (r *TugasRepository) Create(ctx context.Context, req model.CreateTugasRequest) (*model.Tugas, error) {
	tugas := &model.Tugas{}

	err := r.db.QueryRow(ctx,
		`INSERT INTO tugas (matkul, pertemuan, nama_tugas, tanggal_dibuat, deadline)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, matkul, pertemuan, nama_tugas, tanggal_dibuat::text, deadline::text`,
		req.Matkul, req.Pertemuan, req.NamaTugas, req.TanggalDibuat, req.Deadline,
	).Scan(&tugas.ID, &tugas.Matkul, &tugas.Pertemuan, &tugas.NamaTugas, &tugas.TanggalDibuat, &tugas.Deadline)

	if err != nil {
		return nil, err
	}

	return tugas, nil
}

// GetAll mengambil semua data tugas dari database.
func (r *TugasRepository) GetAll(ctx context.Context) ([]model.Tugas, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, matkul, pertemuan, nama_tugas, tanggal_dibuat::text, deadline::text
		 FROM tugas ORDER BY deadline ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tugasList []model.Tugas
	for rows.Next() {
		var t model.Tugas
		if err := rows.Scan(&t.ID, &t.Matkul, &t.Pertemuan, &t.NamaTugas, &t.TanggalDibuat, &t.Deadline); err != nil {
			return nil, err
		}
		tugasList = append(tugasList, t)
	}

	return tugasList, nil
}
