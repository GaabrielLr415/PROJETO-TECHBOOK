$ErrorActionPreference = "Stop"

$projectDir = $PSScriptRoot
$sqlPath = Join-Path $projectDir "database\techbook.sql"

function Find-MysqlExe {
  $candidates = @()

  if ($env:MYSQL_HOME) {
    $candidates += (Join-Path $env:MYSQL_HOME "bin\mysql.exe")
  }

  $candidates += @(
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\mamp\bin\mysql\bin\mysql.exe",
    "C:\MAMP\bin\mysql\bin\mysql.exe"
  )

  $command = Get-Command mysql.exe -ErrorAction SilentlyContinue
  if ($command) {
    $candidates += $command.Source
  }

  $wampRoots = @("C:\wamp64\bin\mysql", "C:\wamp\bin\mysql")
  foreach ($root in $wampRoots) {
    if (Test-Path $root) {
      $candidates += Get-ChildItem $root -Recurse -Filter mysql.exe -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty FullName
    }
  }

  $candidates |
    Where-Object { $_ -and (Test-Path $_) } |
    Select-Object -First 1
}

function Test-MysqlConnection($mysqlExe) {
  try {
    & $mysqlExe -u root -e "SELECT 1;" *> $null
    return ($LASTEXITCODE -eq 0)
  } catch {
    return $false
  }
}

function Open-XamppControl {
  $xamppControl = "C:\xampp\xampp-control.exe"

  if (Test-Path $xamppControl) {
    Start-Process -FilePath $xamppControl -WorkingDirectory "C:\xampp"
    return $true
  }

  return $false
}

if (-not (Test-Path $sqlPath)) {
  Write-Host "Arquivo do banco nao encontrado:" -ForegroundColor Red
  Write-Host $sqlPath
  exit 1
}

$mysqlExe = Find-MysqlExe
if (-not $mysqlExe) {
  Write-Host "MySQL nao encontrado automaticamente." -ForegroundColor Red
  Write-Host "Instale/abra o XAMPP ou confirme se existe C:\xampp\mysql\bin\mysql.exe."
  exit 1
}

Write-Host "MySQL encontrado em: $mysqlExe"
Write-Host "Verificando conexao com o MySQL..."

if (-not (Test-MysqlConnection $mysqlExe)) {
  Open-XamppControl | Out-Null
  Write-Host "Nao foi possivel conectar ao MySQL." -ForegroundColor Red
  Write-Host "No XAMPP, clique em Start no MySQL. Depois rode este arquivo novamente."
  exit 1
}

Write-Host "Criando banco techbook, se ainda nao existir..."
& $mysqlExe -u root -e "CREATE DATABASE IF NOT EXISTS techbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

Write-Host "Importando database\techbook.sql..."
$escapedMysql = $mysqlExe.Replace('"', '\"')
$escapedSql = $sqlPath.Replace('"', '\"')
$importCommand = "`"$escapedMysql`" --default-character-set=utf8mb4 -u root techbook < `"$escapedSql`""
& cmd.exe /c $importCommand
if ($LASTEXITCODE -ne 0) {
  Write-Host "Falha ao importar o banco." -ForegroundColor Red
  exit $LASTEXITCODE
}

$bookCount = (& $mysqlExe -N -B -u root -e "SELECT COUNT(*) FROM techbook.livros;" 2>$null)
Write-Host "Banco pronto. Livros cadastrados: $bookCount" -ForegroundColor Green
