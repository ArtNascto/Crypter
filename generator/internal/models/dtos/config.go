package dtos

type Config struct {
	PostgresPort     string `mapstructure:"PostgresPort"`
	PostgresHost     string `mapstructure:"PostgresHost"`
	PostgresDBName   string `mapstructure:"PostgresDBName"`
	PostgresUser     string `mapstructure:"PostgresUser"`
	PostgresPassword string `mapstructure:"PostgresPassword"`
	RSAPublicKey     string `mapstructure:"RSAPublicKey"`
	PORT             string `mapstructure:"Port"`
	Key              string `mapstructure:"Key"`
	RedisAddress     string `mapstructure:"RedisAddress"`
	RedisDB          int    `mapstructure:"RedisDB"`
}
