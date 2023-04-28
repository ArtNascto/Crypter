package handlers

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/gob"
	"io/ioutil"
	"net/http"
	"qr_generator/internal/global"
	"qr_generator/internal/models/dtos"
	"qr_generator/internal/utils"
	"time"

	"github.com/beevik/guid"
	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
)

func EncryptQrCode(c *gin.Context) {
	msg, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	expTime := 4 * time.Minute
	lim := 24
	var msg1 []byte
	var msg2 []byte
	if len(msg) > lim {
		msg1 = msg[:lim]
		msg2 = msg[lim:]
	} else {
		lim = len(msg) / 2
		msg1 = msg[:lim]
		msg2 = msg[lim:]
	}
	createdAt := time.Now()
	expiresAt := time.Now().Add(expTime)
	token := guid.New().StringUpper()
	dataType := c.ContentType()
	data1 := dtos.Data{
		CreatedAt: createdAt,
		ExpiresAt: expiresAt,
		ID:        token,
		Data:      msg1,
		DataType:  dataType,
	}
	data2 := dtos.Data{
		CreatedAt: createdAt,
		ExpiresAt: expiresAt,
		ID:        token,
		Data:      msg2,
		DataType:  dataType,
	}

	pemData, err := ioutil.ReadFile(global.Config.RSAPublicKey)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pub, err := utils.ParseRsaPublicKeyFromPemStr(string(pemData))

	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var network bytes.Buffer
	enc := gob.NewEncoder(&network)
	err = enc.Encode(data1)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	encryptedBytes, err := rsa.EncryptPKCS1v15(rand.Reader, pub, network.Bytes())
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, err := GenerateQR(base64.StdEncoding.EncodeToString(encryptedBytes))
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	_, err = global.RH.JSONSet(token, ".", data2)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	err = global.RedisClient.Expire(token, expTime).Err()
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": result, "id": token, "expirationDate": utils.TimeToJavaScriptISO(time.Now().Add(expTime))})
}
func GenerateQR(data string) (string, error) {
	var png []byte
	png, err := qrcode.Encode(data, qrcode.Highest, 256)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(png), nil
}
