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
	"net/http"

	"github.com/gin-gonic/gin"
)

func DecodeQrCodeMobile(c *gin.Context) {
	reqBody := new(dtos.DecodeQrCodeInput)
	if reqBody.Data != "" {
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
		processResult, err := base64.StdEncoding.DecodeString(reqBody.Data)
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
		if err != nil {
			global.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
			c.JSON(http.StatusOK, gin.H{"data": str, "contentType": data.DataType, "id": data.ID})
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
			c.JSON(http.StatusOK, gin.H{"result": r})
		}
	} else {
		c.JSON(http.StatusNotFound, gin.H{})
	}
}
