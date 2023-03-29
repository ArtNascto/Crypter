package main

import (
	"os"
	"qr_generator/internal/global"
	"qr_generator/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
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
	viper.SetConfigName("generator")

	// Tell viper the type of your file
	viper.SetConfigType("env")
	viper.AutomaticEnv()
	if err := viper.ReadInConfig(); err != nil {
		global.Log.Info("Reading from runtime enviroments")
		ReadConfFromRuntime()
	}
	err := viper.Unmarshal(&global.Config)
	if err != nil {
		global.Log.Info("Reading from runtime enviroments")
		ReadConfFromRuntime()
	}
	dsn := "host=" + global.Config.PostgresHost + " user=" + global.Config.PostgresUser + " password=" + global.Config.PostgresPassword + " dbname=" + global.Config.PostgresDBName + " port=" + global.Config.PostgresPort + " sslmode=disable"
	global.DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		global.Log.Fatal(err)
		os.Exit(0)
	}

	global.RedisClient = redis.NewClient(&redis.Options{
		Addr:     global.Config.RedisAddress,
		Password: "",
		DB:       global.Config.RedisDB,
	})

	_, err = global.RedisClient.Ping().Result()
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
	if global.Config.PORT == "" {
		global.Config.PORT = "8082"
	}
	r.Run(":" + global.Config.PORT)
}
func ReadConfFromRuntime() {

	global.Config.PostgresPort = os.Getenv("PostgresPort")
	global.Config.PostgresHost = os.Getenv("PostgresHost")
	global.Config.PostgresDBName = os.Getenv("PostgresDBName")
	global.Config.PostgresUser = os.Getenv("PostgresUser")
	global.Config.PostgresPassword = os.Getenv("PostgresPassword")
	global.Config.RSAPublicKey = os.Getenv("RSAPublicKey")
	global.Config.PORT = os.Getenv("Port")
}
