$ErrorActionPreference = "Stop"

$backendPath = (Resolve-Path $PSScriptRoot).Path
$mavenWrapper = Join-Path $backendPath "mvnw.cmd"

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

$javaCommand = Get-Command java -ErrorAction SilentlyContinue
$javaExe = if ($javaCommand) { $javaCommand.Source } else { $null }
$javaMajorVersion = if ($javaExe) { Get-JavaMajorVersion $javaExe } else { 0 }

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
    (Join-Path $backendPath "..\tools"),
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

function Invoke-MavenTests($pathToRun) {
  Push-Location $pathToRun
  try {
    Write-Host "Rodando testes com Java $javaMajorVersion..."
    & ".\mvnw.cmd" test
    return $LASTEXITCODE
  } finally {
    Pop-Location
  }
}

if ($backendPath -notmatch "\s") {
  exit (Invoke-MavenTests $backendPath)
}

$driveLetter = "T"
$substDrive = "$driveLetter`:"
$mapped = $false

foreach ($letter in "T","U","V","W","X","Y","Z") {
  $candidate = "$letter`:"
  $exists = (& subst) -match "^$([regex]::Escape($candidate))\\"
  if (-not $exists -and -not (Test-Path "$candidate\")) {
    $substDrive = $candidate
    break
  }
}

try {
  & subst $substDrive $backendPath
  $mapped = $true
  exit (Invoke-MavenTests "$substDrive\")
} finally {
  if ($mapped) {
    & subst $substDrive /D | Out-Null
  }
}
