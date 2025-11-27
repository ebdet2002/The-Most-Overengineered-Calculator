FROM rust:latest as builder

WORKDIR /usr/src/div-service
COPY . .
RUN cargo install --path .

FROM debian:bookworm-slim
COPY --from=builder /usr/local/cargo/bin/div-service /usr/local/bin/div-service
EXPOSE 8080
CMD ["div-service"]
