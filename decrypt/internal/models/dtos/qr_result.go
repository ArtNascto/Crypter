package dtos

type QRResult struct {
	Message    string     `json:"message"`
	QrResponse QrResponse `json:"qrResponse"`
}
