package dtos

type Config struct {
	PostgresPort     string `mapstructure:"PostgresPort"`
	PostgresHost     string `mapstructure:"PostgresHost"`
	PostgresDBName   string `mapstructure:"PostgresDBName"`
	PostgresUser     string `mapstructure:"PostgresUser"`
	PostgresPassword string `mapstructure:"PostgresPassword"`
	RSAPublicKey     string `mapstructure:"RSAPublicKey"`
	RSAPrivateKey    string `mapstructure:"RSAPrivateKey"`
	PORT             string `mapstructure:"Port"`
	QRDecoder        string `mapstructure:"QRDecoder"`
}
