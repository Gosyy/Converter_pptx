FROM rust:1.78 as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir -p src && echo 'fn main(){}' > src/main.rs && cargo build --release && rm -rf src
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/converter-rust-sidecar /usr/local/bin/rust-sidecar
EXPOSE 7001
CMD ["rust-sidecar"]
