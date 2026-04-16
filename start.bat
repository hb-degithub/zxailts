@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo    Chatroom - Service Starter
echo ========================================
echo.

start "" /b "cmd /c cd /d %~dp0back-end&& npm start > nul 2>&1"
echo [1] Backend API ... OK

start "" /b "cmd /c cd /d %~dp0front-end&& npm run dev > nul 2>&1"
echo [2] Chatroom Frontend ... OK

start "" /b "cmd /c cd /d %~dp0admin-front&& npm run dev > nul 2>&1"
echo [3] Admin Frontend ... OK

echo.
echo Services started!
echo.
echo URLs:
echo   Chatroom   - http://localhost:8080
echo   Admin      - http://localhost:8082
echo   Backend    - http://localhost:3000
echo   Admin API  - http://localhost:3001/api/admin
echo.
pause