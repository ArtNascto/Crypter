package global

import (
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	DB                    *gorm.DB
	Log                   *log.Logger
	RSAPublicKeyLocation  = "./keys/qr_public.pem"
	RSAPrivateKeyLocation = "./keys/qr_private.key"
)
