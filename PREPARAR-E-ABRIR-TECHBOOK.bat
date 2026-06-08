@echo off
set "PROJECT_DIR=%~dp0"

echo Preparando banco de dados TechBook...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_DIR%PREPARAR-BANCO-TECHBOOK.ps1"

if errorlevel 1 (
  echo.
  echo Nao foi possivel preparar o banco automaticamente.
  echo Verifique se o MySQL esta ligado no XAMPP e tente novamente.
  pause
  exit /b 1
)

echo.
echo Banco pronto. Abrindo o TechBook...
call "%PROJECT_DIR%ABRIR-TECHBOOK.bat"
