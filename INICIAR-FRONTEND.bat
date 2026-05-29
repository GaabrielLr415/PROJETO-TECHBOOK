@echo off
set "PROJECT_DIR=%~dp0"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "JWEBSERVER=%USERPROFILE%\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64\bin\jwebserver.exe"

if not exist "%JWEBSERVER%" (
  echo Nao foi possivel encontrar o servidor Java em:
  echo %JWEBSERVER%
  echo.
  echo Abra a pasta frontend com a extensao Live Server do VS Code.
  pause
  exit /b 1
)

echo Iniciando frontend TechBook...
echo URL: http://127.0.0.1:5505/
echo.
"%JWEBSERVER%" -p 5505 -d "%FRONTEND_DIR%"
