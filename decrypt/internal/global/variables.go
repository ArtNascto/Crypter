package global

import (
	"decrypt/internal/models/dtos"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	DB     *gorm.DB
	Log    *log.Logger
	Config dtos.Config
)
