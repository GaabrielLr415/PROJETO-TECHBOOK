@echo off
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_FILE=%PROJECT_DIR%frontend\catalogo.html"
set "API_URL=http://localhost:8080/api/livros"

echo Abrindo backend TechBook...
start "TechBook Backend" /D "%BACKEND_DIR%" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%BACKEND_DIR%\start-backend-window.ps1"

echo.
echo Aguardando o backend responder em %API_URL%...

for /l %%i in (1,1,60) do (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
  if not errorlevel 1 goto backend_ok
  timeout /t 2 /nobreak >nul
)

echo.
echo Nao foi possivel conectar ao backend.
echo Confira a janela "TechBook Backend" para ver o erro.
echo Verifique tambem se o MySQL esta ligado no XAMPP.
pause
exit /b 1

:backend_ok
echo Backend conectado. Abrindo frontend...

start "" "%FRONTEND_FILE%"
