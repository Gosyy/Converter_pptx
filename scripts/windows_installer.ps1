param(
    [switch]$WithDocker = $false
)

Write-Host "=== Converter_pptx Windows bootstrap ==="

if ($WithDocker) {
    Write-Host "Проверка Docker Desktop/WSL2..."
    docker version | Out-Null
}

if (-not (Test-Path "backend/.env")) { Copy-Item "backend/.env.example" "backend/.env" }
if (-not (Test-Path "frontend/.env")) { Copy-Item "frontend/.env.example" "frontend/.env" }

python -m venv backend/.venv
& "backend/.venv/Scripts/pip.exe" install -r backend/requirements.txt

Push-Location frontend
npm install
Pop-Location

Write-Host "Готово. Для native запуска:"
Write-Host "1) backend/.venv/Scripts/python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 8000"
Write-Host "2) cd frontend; npm start"
Write-Host "Для .msi/.exe рекомендуем WiX Toolset + NSSM (следующий этап)."
