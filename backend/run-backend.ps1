$ErrorActionPreference = "Stop"

$mavenWrapper = Join-Path $PSScriptRoot "mvnw.cmd"

function Get-JavaMajorVersion($javaExe) {
  try {
    $javaVersionOutput = (& cmd /c "`"$javaExe`" -version 2>&1") -join "`n"
  } catch {
    return 0
  }
  if ($javaVersionOutput -match 'version "1\.(\d+)') {
    return [int]$Matches[1]
  }
  if ($javaVersionOutput -match 'version "(\d+)') {
    return [int]$Matches[1]
  }
  return 0
}

function Test-PortOpen($port) {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connection = $client.BeginConnect("127.0.0.1", $port, $null, $null)
    if (-not $connection.AsyncWaitHandle.WaitOne(1000)) {
      return $false
    }
    $client.EndConnect($connection)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
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

$javaCommand = Get-Command java -ErrorAction SilentlyContinue
$javaExe = if ($javaCommand) { $javaCommand.Source } else { $null }
$javaMajorVersion = if ($javaExe) { Get-JavaMajorVersion $javaExe } else { 0 }

if ($javaExe -like "*\Common Files\Oracle\Java\javapath\*") {
  $javaMajorVersion = 0
}

if ($javaMajorVersion -lt 17) {
  $candidateJavaExecutables = @(
    "C:\Program Files\Java\jdk-17\bin\java.exe",
    "C:\Program Files\Java\latest\bin\java.exe"
  )

  $javaExe = $candidateJavaExecutables |
    Where-Object { Test-Path $_ } |
    Where-Object { (Get-JavaMajorVersion $_) -ge 17 } |
    Select-Object -First 1

  $javaMajorVersion = if ($javaExe) { Get-JavaMajorVersion $javaExe } else { 0 }
}

if ($javaMajorVersion -lt 17) {
  $candidateRoots = @(
    (Join-Path $PSScriptRoot "..\tools"),
    "C:\Program Files\Java",
    "C:\Program Files\Eclipse Adoptium",
    "$env:USERPROFILE\.vscode\extensions",
    "$env:USERPROFILE\.jdks"
  )

  $javaExe = $candidateRoots |
    Where-Object { Test-Path $_ } |
    ForEach-Object { Get-ChildItem $_ -Recurse -Filter java.exe -ErrorAction SilentlyContinue } |
    Where-Object { (Get-JavaMajorVersion $_.FullName) -ge 17 } |
    Select-Object -First 1 -ExpandProperty FullName

  $javaMajorVersion = if ($javaExe) { Get-JavaMajorVersion $javaExe } else { 0 }
}

if ($javaMajorVersion -lt 17) {
  Write-Error "Java 17 ou superior nao encontrado. Instale o JDK 17+ e tente novamente."
  exit 1
}

$env:JAVA_HOME = Split-Path (Split-Path $javaExe -Parent) -Parent
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

if (-not (Test-Path $mavenWrapper)) {
  Write-Error "Maven Wrapper nao encontrado em $mavenWrapper"
  exit 1
}

if (($env:SPRING_PROFILES_ACTIVE -notmatch "mamp") -and (-not (Test-PortOpen 3306))) {
  Open-XamppControl | Out-Null
  Write-Error "MySQL nao esta ligado. No XAMPP, clique em Start no MySQL e rode este arquivo novamente."
  exit 1
}

$apiUrl = "http://localhost:8080/api/livros"
try {
  $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 2
  if ($response.StatusCode -eq 200) {
    Write-Host "Backend TechBook ja esta rodando em http://localhost:8080/api"
    exit 0
  }
} catch {
  $portInUse = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
  if ($portInUse) {
    Write-Error "A porta 8080 ja esta em uso, mas a API TechBook nao respondeu em $apiUrl. Feche o processo da porta 8080 ou altere a porta do backend."
    exit 1
  }
}

Write-Host "Iniciando backend TechBook..."
Write-Host "API: http://localhost:8080/api"

& $mavenWrapper "-Dmaven.test.skip=true" spring-boot:run
exit $LASTEXITCODE
