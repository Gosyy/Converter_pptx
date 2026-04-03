#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "[macOS] Project root: $ROOT_DIR"

# 1) Prepare env files
[[ -f "$BACKEND_DIR/.env" ]] || cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
[[ -f "$FRONTEND_DIR/.env" ]] || cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"

# 2) Backend venv + deps
if [[ ! -d "$BACKEND_DIR/.venv" ]]; then
  python3 -m venv "$BACKEND_DIR/.venv"
fi
source "$BACKEND_DIR/.venv/bin/activate"
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"
deactivate

# 3) Frontend deps
cd "$FRONTEND_DIR"
npm install
npm run build

# 4) Start backend + frontend in separate Terminal tabs (macOS)
osascript <<EOF
tell application "Terminal"
  activate
  do script "cd '$BACKEND_DIR' && source .venv/bin/activate && PRELOAD_MODELS=false python -m uvicorn src.main:app --host 127.0.0.1 --port 8000"
  do script "cd '$FRONTEND_DIR' && npm start"
end tell
EOF

echo "Started:"
echo "- Backend:  http://127.0.0.1:8000/api/docs"
echo "- Frontend: http://127.0.0.1:3000"
