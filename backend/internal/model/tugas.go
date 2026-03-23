// Package model mendefinisikan struktur data utama (entity).
package model

// Tugas merepresentasikan tugas mahasiswa di database.
type Tugas struct {
	ID            string `json:"id"`
	Matkul        string `json:"matkul"`
	Pertemuan     int    `json:"pertemuan"`
	NamaTugas     string `json:"nama_tugas"`
	TanggalDibuat string `json:"tanggal_dibuat"`
	Deadline      string `json:"deadline"`
}

// CreateTugasRequest adalah payload untuk membuat tugas baru.
type CreateTugasRequest struct {
	Matkul        string `json:"matkul" binding:"required"`
	Pertemuan     int    `json:"pertemuan" binding:"required"`
	NamaTugas     string `json:"nama_tugas" binding:"required"`
	TanggalDibuat string `json:"tanggal_dibuat" binding:"required"`
	Deadline      string `json:"deadline" binding:"required"`
}
