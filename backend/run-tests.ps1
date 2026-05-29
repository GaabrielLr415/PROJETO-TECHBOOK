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

$javaCommand = Get-Command java -ErrorAction SilentlyContinue
$javaExe = if ($javaCommand) { $javaCommand.Source } else { $null }
$javaMajorVersion = if ($javaExe) { Get-JavaMajorVersion $javaExe } else { 0 }

if ($javaMajorVersion -lt 17) {
  $candidateRoots = @(
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

Write-Host "Rodando testes com Java $javaMajorVersion..."
& $mavenWrapper test
exit $LASTEXITCODE
