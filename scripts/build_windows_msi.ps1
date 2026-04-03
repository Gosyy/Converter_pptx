$ErrorActionPreference = "Stop"

if (-not (Get-Command candle.exe -ErrorAction SilentlyContinue)) {
  throw "WiX Toolset not found. Install WiX v3 and ensure candle.exe/light.exe in PATH."
}

New-Item -ItemType Directory -Force -Path dist | Out-Null
candle.exe -out dist/ packaging/windows/installer.wxs
light.exe -out dist/Converter_pptx.msi dist/installer.wixobj
Write-Host "MSI built: dist/Converter_pptx.msi"
