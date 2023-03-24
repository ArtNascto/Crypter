package handlers

import (
	"crypto/rand"
	"crypto/rsa"
	"decrypt/internal/global"
	"decrypt/internal/utils"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"gopkg.in/h2non/gentleman.v2"
	"gopkg.in/h2non/gentleman.v2/plugins/body"
)

func DecodeQrCode(c *gin.Context) {
	reqBody := new(DecodeQrCodeInput)
	err := c.Bind(reqBody)
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create a new client
	cli := gentleman.New()

	// Define the Base URL
	cli.URL(global.Config.QRDecoder)

	// Create a new request based on the current client
	req := cli.Request()

	// Method to be used
	req.Method("POST")

	// Define the JSON payload via body plugin
	req.Use(body.JSON(reqBody))

	// Perform the request
	res, err := req.Send()
	if err != nil {
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !res.Ok {
		err = fmt.Errorf("Invalid server response: %d\n", res.StatusCode)
		global.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	data := QRResult{}
	json.Unmarshal([]byte(res.String()), &data)
	if len(data.QrResponse.Values) > 0 {

		pemData, err := ioutil.ReadFile(global.Config.RSAPrivateKey)
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		priv, err := utils.ParseRsaPrivateKeyFromPemStr(string(pemData))
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		processResult, err := base64.StdEncoding.DecodeString(data.QrResponse.Values[0].Data)
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		decryptedBytes, err := priv.Decrypt(rand.Reader, processResult, &rsa.PKCS1v15DecryptOptions{})
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"result": string(decryptedBytes)})
	} else {
		c.JSON(http.StatusOK, gin.H{"result": ""})

	}
}

type DecodeQrCodeInput struct {
	Data string `json:"data"`
}
type QRResult struct {
	Message    string     `json:"message"`
	QrResponse QrResponse `json:"qrResponse"`
}
type QrResponse struct {
	Values []QRValues `json:"values"`
}
type QRValues struct {
	Croped string `json:"croped"`
	Data   string `json:"data"`
}
