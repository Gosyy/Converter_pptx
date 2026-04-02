#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/7] Backend .env"
if [[ ! -f backend/.env ]]; then
  cp backend/.env.example backend/.env
  echo "  backend/.env was created from example"
else
  echo "  backend/.env already exists"
fi

echo "[2/7] Force USE_DATABASE=true"
if rg -q '^USE_DATABASE=' backend/.env; then
  sed -i 's/^USE_DATABASE=.*/USE_DATABASE=true/' backend/.env
else
  echo 'USE_DATABASE=true' >> backend/.env
fi

echo "[3/7] Start/check Postgres"
docker compose up -d postgres
sleep 4
docker compose ps postgres

echo "[4/7] Check ML dependencies"
python - <<'PY'
import importlib
mods=['torch','sentence_transformers','transformers']
missing=[]
for m in mods:
    try:
        importlib.import_module(m)
    except Exception:
        missing.append(m)
if missing:
    raise SystemExit('Missing: ' + ', '.join(missing))
print('ML dependencies are installed')
PY

echo "[5/7] Frontend .env"
if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.example frontend/.env
fi
if rg -q '^REACT_APP_API_URL=' frontend/.env; then
  sed -i 's|^REACT_APP_API_URL=.*|REACT_APP_API_URL=http://localhost:8000/api|' frontend/.env
else
  echo 'REACT_APP_API_URL=http://localhost:8000/api' >> frontend/.env
fi

echo "[6/7] Start backend + frontend"
docker compose up -d backend frontend

echo "[7/7] Scenario checks"
curl -sS -X POST 'http://localhost:8000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"guest@example.com","password":"guest"}' | tee /tmp/login.json

python - <<'PY'
from pathlib import Path
import json
payload=json.loads(Path('/tmp/login.json').read_text())
print('login response keys:', sorted(payload.keys()))
PY

echo "Open UI: http://localhost:3000"
echo "Generate page: http://localhost:3000/generate"
echo "Editor page: http://localhost:3000/editor"
