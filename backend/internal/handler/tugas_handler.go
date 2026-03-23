// Package handler menangani HTTP request dan response.
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

// CreateTugas menangani POST /tugas — menambah tugas baru.
func (h *TugasHandler) CreateTugas(c *gin.Context) {
	var req model.CreateTugasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tugas, err := h.svc.CreateTugas(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tugas"})
		return
	}

	c.JSON(http.StatusCreated, tugas)
}

// GetAllTugas menangani GET /tugas — mengambil semua tugas.
func (h *TugasHandler) GetAllTugas(c *gin.Context) {
	tugasList, err := h.svc.GetAllTugas(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tugas"})
		return
	}

	// Kembalikan array kosong jika nil
	if tugasList == nil {
		tugasList = []model.Tugas{}
	}

	c.JSON(http.StatusOK, tugasList)
}
