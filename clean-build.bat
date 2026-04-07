@echo off
REM Clean cache and rebuild

cd /d "F:\AR_UPDATE4-main\AR_UPDATE4-main"

echo.
echo ========================================
echo Cleaning cache and old builds...
echo ========================================

REM Remove old build artifacts
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo [OK] Cache cleared
echo.

echo ========================================
echo Rebuilding fresh...
echo ========================================
call npm run build

if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build successful! Starting preview...
echo ========================================
echo.
echo Open your browser to: http://localhost:4173
echo.
call npm run preview
