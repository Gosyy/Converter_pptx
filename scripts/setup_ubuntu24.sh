#!/usr/bin/env bash
set -euo pipefail

# Ubuntu 24+ bootstrap for Converter_pptx
# - installs Docker Engine + Compose plugin (no Docker Desktop)
# - prepares env files with required values
# - builds/starts stack

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUN_FRONTEND=true
if [[ "${1:-}" == "--no-frontend" ]]; then
  RUN_FRONTEND=false
fi

if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  if rg -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "[1/8] Install Docker Engine + Compose plugin"
$SUDO apt-get update
$SUDO apt-get install -y ca-certificates curl gnupg
$SUDO install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  $SUDO curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  $SUDO chmod a+r /etc/apt/keyrings/docker.asc
fi

CODENAME="$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${CODENAME} stable" | \
  $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null || true

if ! $SUDO apt-get update; then
  echo "[warn] '${CODENAME}' repo failed, fallback to noble"
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" | \
    $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
  $SUDO apt-get update
fi

$SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
$SUDO systemctl enable --now docker

CURRENT_USER="${SUDO_USER:-$USER}"
if ! groups "$CURRENT_USER" | grep -q '\bdocker\b'; then
  $SUDO usermod -aG docker "$CURRENT_USER"
  echo "[info] user '$CURRENT_USER' added to docker group. Relogin may be required."
fi

echo "[2/8] Docker versions"
docker --version || true
docker compose version || true

echo "[3/8] Prepare env files"
[[ -f .env ]] || touch .env
[[ -f backend/.env ]] || cp backend/.env.example backend/.env
[[ -f frontend/.env ]] || cp frontend/.env.example frontend/.env

echo "[4/8] Fill required .env values"
upsert_env .env POSTGRES_USER postgres
upsert_env .env POSTGRES_PASSWORD postgres
upsert_env .env POSTGRES_DB converter
upsert_env .env POSTGRES_HOST postgres
upsert_env .env POSTGRES_PORT 5432
upsert_env .env FEATURE_RUST_SIDECAR false
upsert_env .env FEATURE_KANDINSKY false
upsert_env .env FEATURE_PROGRESS_WS true
upsert_env .env RUST_SIDECAR_URL http://rust-sidecar:7001

upsert_env backend/.env USE_DATABASE true
upsert_env backend/.env POSTGRES_USER postgres
upsert_env backend/.env POSTGRES_PASSWORD postgres
upsert_env backend/.env POSTGRES_DB converter
upsert_env backend/.env POSTGRES_HOST postgres
upsert_env backend/.env POSTGRES_PORT 5432
upsert_env backend/.env DOMAIN http://localhost:3000
upsert_env backend/.env FRONT_URL http://localhost:3000
upsert_env backend/.env CORS_ORIGINS http://localhost:3000
upsert_env backend/.env FEATURE_RUST_SIDECAR false
upsert_env backend/.env FEATURE_KANDINSKY false
upsert_env backend/.env FEATURE_PROGRESS_WS true
upsert_env backend/.env FEATURE_DB_TOGGLE_ADMIN true
upsert_env backend/.env RUST_SIDECAR_URL http://rust-sidecar:7001
upsert_env backend/.env RUST_SIDECAR_TIMEOUT 30
upsert_env backend/.env SECRET_MANAGER_URL ""
upsert_env backend/.env SECRET_MANAGER_TOKEN ""
upsert_env backend/.env SECRET_MANAGER_TIMEOUT 5

upsert_env frontend/.env REACT_APP_API_URL http://localhost:8000/api

if ! rg -q '^GIGACHAT_AUTH_KEY=' backend/.env; then
  echo 'GIGACHAT_AUTH_KEY=put_real_gigachat_key_here' >> backend/.env
fi

echo "[5/8] Validate required backend env"
if rg -q '^GIGACHAT_AUTH_KEY=$' backend/.env || rg -q '^GIGACHAT_AUTH_KEY=put_real_gigachat_key_here$' backend/.env; then
  echo "[error] Set a real GIGACHAT_AUTH_KEY in backend/.env"
  exit 1
fi

echo "[6/8] Build and start containers"
if [[ "$RUN_FRONTEND" == "true" ]]; then
  docker compose up -d --build
else
  docker compose up -d --build backend postgres
fi

echo "[7/8] Services status + logs"
docker compose ps
if [[ "$RUN_FRONTEND" == "true" ]]; then
  docker compose logs --tail=100 frontend backend postgres
else
  docker compose logs --tail=100 backend postgres
fi

echo "[8/8] Health checks"
curl -fsS -I http://localhost:8000/api/docs >/dev/null
if [[ "$RUN_FRONTEND" == "true" ]]; then
  curl -fsS -I http://localhost:3000 >/dev/null
fi

echo
echo "Done. Endpoints:"
if [[ "$RUN_FRONTEND" == "true" ]]; then
  echo "  Frontend: 127.0.0.1:3000"
fi
echo "  Backend: 127.0.0.1:8000"
echo "  Postgres: 127.0.0.1:5432"
