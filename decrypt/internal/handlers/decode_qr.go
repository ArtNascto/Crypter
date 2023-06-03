package handlers

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"decrypt/internal/global"
	"decrypt/internal/models/dtos"
	"decrypt/internal/utils"
	"encoding/base64"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"time"

	"github.com/avast/retry-go"

	"github.com/gin-gonic/gin"
	"gopkg.in/h2non/gentleman.v2"
	"gopkg.in/h2non/gentleman.v2/plugins/body"
)

func DecodeQrCode(c *gin.Context) {
	reqBody := new(dtos.DecodeQrCodeInput)
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

	var res *gentleman.Response
	err = retry.Do(
		func() error {
			var err error
			res, err = req.Send()
			return err
		},
		retry.Attempts(3),
		retry.OnRetry(func(n uint, err error) {
			log.Printf("Retrying request after error: %v", err)
		}),
	)

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
	data := dtos.QRResult{}
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

		buf := bytes.NewBuffer(decryptedBytes)
		dec := gob.NewDecoder(buf)

		data := dtos.Data{}

		if err := dec.Decode(&data); err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		expired, err := expired(data.ExpiresAt)
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if expired {
			err = fmt.Errorf("data is expired")
			global.Log.Error(err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		res, err := global.RH.JSONGet(data.ID, ".")
		if err != nil && err.Error() != "redis: nil" {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		} else if err != nil && err.Error() == "redis: nil" {
			global.Log.Error(err)
			c.JSON(http.StatusNotFound, gin.H{"error": "data not found"})
			return
		}
		var objOut dtos.Data
		err = json.Unmarshal(res.([]byte), &objOut)
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		dataConcat := append(data.Data, objOut.Data...)
		if data.DataType != "application/json" {
			err = removeContent(data.ID)
			if err != nil {
				global.Log.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			str := base64.StdEncoding.EncodeToString(dataConcat)
			extension := ".png"
			ext, err := mime.ExtensionsByType(data.DataType)
			if err != nil {
				global.Log.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if len(ext) > 0 {
				extension = ext[0]
			}
			c.JSON(http.StatusOK, gin.H{"data": str, "contentType": data.DataType, "id": data.ID, "fileName": data.ID + extension})
		} else {
			var r map[string]interface{}
			err = json.Unmarshal(dataConcat, &r)
			if err != nil {
				global.Log.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			err = removeContent(data.ID)
			if err != nil {
				global.Log.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"result": r, "fileName": data.ID + ".json"})
		}
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "QR not found on image, please try again"})
	}
}
func removeContent(id string) error {
	err := global.RedisClient.Del(id).Err()
	if err != nil {
		return err
	}
	return nil
}
func expired(exp time.Time) (bool, error) {
	now := time.Now()
	if now.Sub(exp).Seconds() <= 0 {
		return false, nil
	}

	return true, nil
}
