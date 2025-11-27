FROM nimlang/nim:latest AS builder

WORKDIR /app
COPY . .
RUN nim c -d:release --mm:orc --threads:on app.nim

FROM debian:bookworm
COPY --from=builder /app/app /usr/local/bin/mem-service
# Install runtime dependencies for Nim/Jester if needed (usually glibc/openssl)
RUN apt-get update && apt-get install -y libssl-dev && rm -rf /var/lib/apt/lists/*

EXPOSE 5000
CMD ["mem-service"]
