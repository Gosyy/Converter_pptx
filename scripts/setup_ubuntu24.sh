#!/usr/bin/env bash
set -euo pipefail

# Ubuntu 24+ bootstrap for Converter_pptx
# - installs Docker Engine + Compose plugin (no Docker Desktop)
# - prepares env files
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

echo "[1/7] Install Docker Engine + Compose plugin"
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

echo "[2/7] Docker versions"
docker --version || true
docker compose version || true

echo "[3/7] Prepare env files"
[[ -f backend/.env ]] || cp backend/.env.example backend/.env
[[ -f frontend/.env ]] || cp frontend/.env.example frontend/.env

echo "[4/7] Validate required backend env"
if ! rg -q '^GIGACHAT_AUTH_KEY=' backend/.env; then
  echo "[error] backend/.env must contain GIGACHAT_AUTH_KEY"
  exit 1
fi

echo "[5/7] Build and start containers"
if [[ "$RUN_FRONTEND" == "true" ]]; then
  docker compose up -d --build
else
  docker compose up -d --build backend postgres
fi

echo "[6/7] Services status"
docker compose ps

echo "[7/7] Health checks"
curl -fsS -I http://localhost:8000/api/docs >/dev/null
if [[ "$RUN_FRONTEND" == "true" ]]; then
  curl -fsS -I http://localhost:3000 >/dev/null
fi

echo
if [[ "$RUN_FRONTEND" == "true" ]]; then
  echo "Done. Open:"
  echo "  Frontend: http://localhost:3000"
fi
echo "  Backend docs: http://localhost:8000/api/docs"
