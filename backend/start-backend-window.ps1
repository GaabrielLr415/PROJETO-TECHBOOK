$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$logPath = Join-Path $PSScriptRoot "backend-run.log"

"Iniciando backend TechBook em $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logPath -Encoding utf8

try {
  .\run-backend.ps1 2>&1 | Tee-Object -FilePath $logPath -Append
} catch {
  "ERRO: $($_.Exception.Message)" | Tee-Object -FilePath $logPath -Append
  Write-Host ""
  Write-Host "O backend nao iniciou. Veja o arquivo backend-run.log nesta pasta." -ForegroundColor Red
  Read-Host "Pressione Enter para fechar"
  exit 1
}
