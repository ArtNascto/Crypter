package main

import (
	"os"
	"qr_generator/internal/global"
	"qr_generator/internal/handlers"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func init() {
	// Log as JSON instead of the default ASCII formatter.
	global.Log = log.New()
	global.Log.SetFormatter(&log.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	global.Log.SetOutput(os.Stdout)

	// Only log the warning severity or above.
	global.Log.SetLevel(log.WarnLevel)
	var err error
	dsn := "host=localhost user=ADMIN password=admin_pass dbname=postgres port=5432 sslmode=disable"
	global.DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		global.Log.Fatal(err)
		os.Exit(0)
	}

}

func main() {

	r := gin.Default()
	r.GET("/ping", handlers.Ping)
	r.GET("/debug/statsviz/*filepath", handlers.GetStatus)
	r.POST("/generate", handlers.EncryptQrCode)
	r.POST("/decode", handlers.DecodeQrCode)
	r.Run()
}
