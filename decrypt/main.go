package main

import (
	"decrypt/internal/global"
	"decrypt/internal/handlers"
	"os"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
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
	viper.AddConfigPath(".")

	// Tell viper the name of your file
	viper.SetConfigName("decrypt")

	// Tell viper the type of your file
	viper.SetConfigType("env")
	if err := viper.ReadInConfig(); err != nil {
		global.Log.Fatal(err)
		os.Exit(0)
	}
	err := viper.Unmarshal(&global.Config)
	if err != nil {
		global.Log.Fatal(err)
		os.Exit(0)
	}
	dsn := "host=" + global.Config.PostgresHost + " user=" + global.Config.PostgresUser + " password=" + global.Config.PostgresPassword + " dbname=" + global.Config.PostgresDBName + " port=" + global.Config.PostgresPort + " sslmode=disable"
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
	r.POST("/decrypt", handlers.DecodeQrCode)
	if global.Config.PORT == "" {
		global.Config.PORT = "8083"
	}
	r.Run(":" + global.Config.PORT)
}
