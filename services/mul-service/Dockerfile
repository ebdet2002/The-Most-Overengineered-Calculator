FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o mul-service main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/mul-service .
EXPOSE 8080
CMD ["./mul-service"]
