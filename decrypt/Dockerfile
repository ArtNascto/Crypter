FROM golang:1.20.2-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go mod tidy
RUN go build -o /out/decrypt main.go

FROM alpine:3.14
WORKDIR /app
RUN apk add --no-cache tzdata
COPY --from=build /out .

ENV PostgresPort=5432
ENV PostgresHost=localhost
ENV PostgresDBName=postgres
ENV PostgresUser=ADMIN
ENV PostgresPassword=admin_pass
ENV RSAPrivateKey=./qr_private.key
ENV Port=8083
ENV QRDecoder=http://localhost:8080/qr/GetQrCode
ENV RedisAddress=localhost:6379
ENV RedisDB=0
ENTRYPOINT [ "./decrypt" ]