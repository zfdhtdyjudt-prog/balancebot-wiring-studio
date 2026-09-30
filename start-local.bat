@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  echo Opening local server at http://127.0.0.1:4173
  py -m http.server 4173
  exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo Opening local server at http://127.0.0.1:4173
  python -m http.server 4173
  exit /b
)
echo Python was not found. Please use VS Code Live Server / Go Live.
pause
