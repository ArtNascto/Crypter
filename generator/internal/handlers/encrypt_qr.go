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
	data := dtos.Data{
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(4 * time.Second),
		ID:        guid.New().StringUpper(),
		Data:      msg,
		DataType:  c.ContentType(),
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
	err = enc.Encode(data)
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

	c.JSON(http.StatusOK, gin.H{"result": result})
}
func GenerateQR(data string) (string, error) {
	var png []byte
	png, err := qrcode.Encode(data, qrcode.Low, 256)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(png), nil
}
