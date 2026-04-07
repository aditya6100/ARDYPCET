@echo off
REM Test build and preview
cd /d "F:\AR_UPDATE4-main\AR_UPDATE4-main"

echo.
echo ========================================
echo Step 1: Building...
echo ========================================
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Preview
echo ========================================
echo Starting preview server...
echo Open http://localhost:4173 in your browser
echo Press Ctrl+C to stop
echo.
call npm run preview
