// Package handler menangani HTTP request dan response untuk tugas.
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"tugas-reminder/backend/internal/model"
	"tugas-reminder/backend/internal/service"
)

// TugasHandler menangani endpoint terkait tugas.
type TugasHandler struct {
	svc *service.TugasService
}

// NewTugasHandler membuat instance handler baru.
func NewTugasHandler(svc *service.TugasService) *TugasHandler {
	return &TugasHandler{svc: svc}
}

// GetAllTugas menangani GET /api/tugas — mengambil semua tugas.
func (h *TugasHandler) GetAllTugas(c *gin.Context) {
	tugasList, err := h.svc.GetAllTugas(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tugas: " + err.Error()})
		return
	}

	if tugasList == nil {
		tugasList = []model.Tugas{}
	}

	c.JSON(http.StatusOK, tugasList)
}

// GetPendingReminders menangani GET /api/tugas/pending-reminders.
// Endpoint ini mengembalikan reminder yang perlu dikirim hari ini.
func (h *TugasHandler) GetPendingReminders(c *gin.Context) {
	reminders, err := h.svc.GetPendingReminders(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil pending reminders: " + err.Error()})
		return
	}

	if reminders == nil {
		reminders = []model.PendingReminder{}
	}

	c.JSON(http.StatusOK, reminders)
}

// GetTugasByID menangani GET /api/tugas/:id — mengambil tugas berdasarkan ID.
func (h *TugasHandler) GetTugasByID(c *gin.Context) {
	id := c.Param("id")

	tugas, err := h.svc.GetTugasByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, tugas)
}

// CreateTugas menangani POST /api/tugas — menambah tugas baru.
func (h *TugasHandler) CreateTugas(c *gin.Context) {
	var req model.CreateTugasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	tugas, err := h.svc.CreateTugas(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tugas: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, tugas)
}

// UpdateTugas menangani PUT /api/tugas/:id — mengupdate tugas.
func (h *TugasHandler) UpdateTugas(c *gin.Context) {
	id := c.Param("id")

	var req model.CreateTugasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	tugas, err := h.svc.UpdateTugas(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate tugas: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, tugas)
}

// DeleteTugas menangani DELETE /api/tugas/:id — menghapus tugas.
func (h *TugasHandler) DeleteTugas(c *gin.Context) {
	id := c.Param("id")

	err := h.svc.DeleteTugas(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tugas: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tugas berhasil dihapus"})
}

// CreateNotificationLog menangani POST /api/notification-log.
// Dipanggil oleh OpenClaw setelah mengirim notifikasi Telegram.
func (h *TugasHandler) CreateNotificationLog(c *gin.Context) {
	var req model.CreateNotificationLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	err := h.svc.CreateNotificationLog(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan notification log: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Notification log berhasil disimpan"})
}
