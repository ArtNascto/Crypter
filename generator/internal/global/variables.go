package global

import (
	"qr_generator/internal/models/dtos"

	"github.com/go-redis/redis"
	"github.com/nitishm/go-rejson"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	DB          *gorm.DB
	Log         *log.Logger
	Config      dtos.Config
	RedisClient *redis.Client
	RH          *rejson.Handler
)
