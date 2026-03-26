// Package handler menangani HTTP request dan response untuk matkul.
package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"tugas-reminder/backend/internal/model"
	"tugas-reminder/backend/internal/repository"
)

// MatkulHandler menangani endpoint terkait mata kuliah.
type MatkulHandler struct {
	repo *repository.MatkulRepository
}

// NewMatkulHandler membuat instance handler baru.
func NewMatkulHandler(repo *repository.MatkulRepository) *MatkulHandler {
	return &MatkulHandler{repo: repo}
}

// GetAllMatkul menangani GET /api/matkul — mengambil semua mata kuliah.
func (h *MatkulHandler) GetAllMatkul(c *gin.Context) {
	matkulList, err := h.repo.GetAll(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data matkul: " + err.Error()})
		return
	}

	if matkulList == nil {
		matkulList = []model.Matkul{}
	}

	c.JSON(http.StatusOK, matkulList)
}

// CreateMatkul menangani POST /api/matkul — menambah mata kuliah baru.
func (h *MatkulHandler) CreateMatkul(c *gin.Context) {
	var req model.CreateMatkulRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	matkul, err := h.repo.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan matkul: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, matkul)
}
