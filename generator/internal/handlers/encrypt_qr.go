package handlers

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"io/ioutil"
	"net/http"
	"qr_generator/internal/global"
	"qr_generator/internal/utils"

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

	encryptedBytes, err := rsa.EncryptPKCS1v15(rand.Reader, pub, msg)
	if err != nil {
		panic(err)
	}

	var png []byte
	png, err = qrcode.Encode(string(base64.StdEncoding.EncodeToString(encryptedBytes)), qrcode.Low, 256)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	result := base64.StdEncoding.EncodeToString(png)
	c.JSON(http.StatusOK, gin.H{"result": result})
}
