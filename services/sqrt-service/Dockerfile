FROM alpine:latest as builder

WORKDIR /app
RUN apk add --no-cache curl tar xz

# Download Zig 0.11.0 (stable)
RUN curl -L https://ziglang.org/download/0.11.0/zig-linux-aarch64-0.11.0.tar.xz | tar -xJ
ENV PATH="/app/zig-linux-aarch64-0.11.0:${PATH}"

COPY main.zig .
RUN zig build-exe main.zig -target aarch64-linux-musl -O ReleaseSmall

FROM scratch
COPY --from=builder /app/main /main
EXPOSE 8080
CMD ["/main"]
