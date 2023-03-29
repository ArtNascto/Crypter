FROM golang:1.20.2-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go mod tidy
RUN go build -o /out/generator main.go

FROM alpine:3.14
WORKDIR /app
RUN apk add --no-cache tzdata
COPY --from=build /out .

ENV PostgresPort=5432
ENV PostgresHost=localhost
ENV PostgresDBName=postgres
ENV PostgresUser=ADMIN
ENV PostgresPassword=admin_pass
ENV RSAPublicKey=./qr_public.pem
ENV Port=8082
ENV RedisAddress=localhost:6379
ENV RedisDB=0

ENTRYPOINT [ "./generator" ]