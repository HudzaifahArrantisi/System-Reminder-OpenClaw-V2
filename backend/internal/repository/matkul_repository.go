// Package repository menangani akses data ke PostgreSQL untuk matkul.
package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"tugas-reminder/backend/internal/model"
)

// MatkulRepository menyediakan operasi CRUD untuk tabel matkul.
type MatkulRepository struct {
	db *pgxpool.Pool
}

// NewMatkulRepository membuat instance repository baru.
func NewMatkulRepository(db *pgxpool.Pool) *MatkulRepository {
	return &MatkulRepository{db: db}
}

// GetAll mengambil semua mata kuliah, ORDER BY nama_matkul ASC.
func (r *MatkulRepository) GetAll(ctx context.Context) ([]model.Matkul, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, nama_matkul, COALESCE(kode_matkul, ''), created_at
		 FROM matkul ORDER BY nama_matkul ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query matkul: %w", err)
	}
	defer rows.Close()

	var matkulList []model.Matkul
	for rows.Next() {
		var m model.Matkul
		if err := rows.Scan(&m.ID, &m.NamaMatkul, &m.KodeMatkul, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan matkul: %w", err)
		}
		matkulList = append(matkulList, m)
	}

	return matkulList, nil
}

// Create menyimpan mata kuliah baru.
func (r *MatkulRepository) Create(ctx context.Context, req model.CreateMatkulRequest) (*model.Matkul, error) {
	var matkul model.Matkul
	err := r.db.QueryRow(ctx,
		`INSERT INTO matkul (nama_matkul, kode_matkul)
		 VALUES ($1, $2)
		 RETURNING id, nama_matkul, kode_matkul, created_at`,
		req.NamaMatkul, req.KodeMatkul,
	).Scan(&matkul.ID, &matkul.NamaMatkul, &matkul.KodeMatkul, &matkul.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert matkul: %w", err)
	}

	return &matkul, nil
}
