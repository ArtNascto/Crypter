package dtos

import "time"

type Data struct {
	CreatedAt time.Time
	ExpiresAt time.Time
	ID        string
	DataType  string
	Data      []byte
}
