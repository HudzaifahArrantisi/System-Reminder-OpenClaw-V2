// Package model mendefinisikan struktur data utama (entity).
package model

import "time"

// Tugas merepresentasikan tugas mahasiswa di database (JOIN dengan matkul).
type Tugas struct {
	ID            string    `json:"id"`
	MatkulID      string    `json:"matkul_id"`
	NamaMatkul    string    `json:"nama_matkul"`
	KodeMatkul    string    `json:"kode_matkul"`
	Pertemuan     int       `json:"pertemuan"`
	NamaTugas     string    `json:"nama_tugas"`
	TanggalDibuat string    `json:"tanggal_dibuat"`
	Deadline      string    `json:"deadline"`
	CreatedAt     time.Time `json:"created_at"`
}

// CreateTugasRequest adalah payload untuk membuat tugas baru.
type CreateTugasRequest struct {
	MatkulID      string `json:"matkul_id" binding:"required"`
	Pertemuan     int    `json:"pertemuan" binding:"required,min=1,max=18"`
	NamaTugas     string `json:"nama_tugas" binding:"required"`
	TanggalDibuat string `json:"tanggal_dibuat" binding:"required"`
	Deadline      string `json:"deadline" binding:"required"`
}

// Matkul merepresentasikan mata kuliah.
type Matkul struct {
	ID         string    `json:"id"`
	NamaMatkul string    `json:"nama_matkul"`
	KodeMatkul string    `json:"kode_matkul"`
	CreatedAt  time.Time `json:"created_at"`
}

// CreateMatkulRequest adalah payload untuk membuat mata kuliah baru.
type CreateMatkulRequest struct {
	NamaMatkul string `json:"nama_matkul" binding:"required"`
	KodeMatkul string `json:"kode_matkul" binding:"required"`
}

// PendingReminder berisi data reminder yang belum terkirim hari ini.
type PendingReminder struct {
	ReminderID   string `json:"reminder_id"`
	ReminderType string `json:"reminder_type"`
	ReminderDate string `json:"reminder_date"`
	TugasID      string `json:"tugas_id"`
	NamaTugas    string `json:"nama_tugas"`
	Deadline     string `json:"deadline"`
	Pertemuan    int    `json:"pertemuan"`
	NamaMatkul   string `json:"nama_matkul"`
	KodeMatkul   string `json:"kode_matkul"`
}

// CreateNotificationLogRequest adalah payload untuk mencatat hasil pengiriman notifikasi.
type CreateNotificationLogRequest struct {
	TugasID      string `json:"tugas_id" binding:"required"`
	ReminderType string `json:"reminder_type" binding:"required"`
	Status       string `json:"status" binding:"required"`
}
