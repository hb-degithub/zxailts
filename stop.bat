@echo off
echo Stopping all Node.js services...
taskkill /f /im node.exe 2>nul
echo All services stopped.
pause
