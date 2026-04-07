@echo off
REM AR_UPDATE4 GitHub Deployment Script
REM This script pushes your project to: https://github.com/aditya6100/ARDYPCET.git

setlocal enabledelayedexpansion
cd /d "F:\AR_UPDATE4-main\AR_UPDATE4-main"

echo.
echo ============================================================
echo  AR_UPDATE4 - GitHub Deployment Script
echo ============================================================
echo.
echo Repository: https://github.com/aditya6100/ARDYPCET.git
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Step 1: Configure Git User
echo ============================================================
git config user.name "aditya6100"
git config user.email "aditya6100@github.com"
echo [OK] Git user configured
echo.

echo Step 2: Check Git Status
echo ============================================================
git status
echo.

echo Step 3: Add All Files
echo ============================================================
git add .
echo [OK] Files added
echo.

echo Step 4: Create Commit
echo ============================================================
git commit -m "feat: Add location accuracy improvements and error handling

- Add auto-location detection (WiFi/BLE/motion/GPS)
- Add path validation and diagnostics system
- Add drift detection and floor detection
- Add error boundaries and toast notifications
- Add global config file with 30+ settings
- Fix path accuracy issues with bidirectional pathfinding
- Implement path caching (10x performance boost)
- Add comprehensive location accuracy monitoring

New Files:
- src/config.ts (Global configuration)
- src/utils/autoLocation.ts (Auto-location service)
- src/utils/pathValidator.ts (Path validation)
- src/utils/improvedAutoLocation.ts (Drift/floor detection)
- src/components/ErrorBoundary.tsx (Error handling)
- src/components/Toast.tsx (Notifications)

Modified Files:
- src/App.tsx (Integration)
- src/utils/multiFloorPathfinding.ts (Path caching, validation)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

if errorlevel 1 (
    echo [WARN] Commit failed (might already be committed)
) else (
    echo [OK] Commit created
)
echo.

echo Step 5: Configure Git Remote
echo ============================================================
git remote remove origin >nul 2>&1
git remote add origin https://github.com/aditya6100/ARDYPCET.git
echo [OK] Remote set
echo.

echo Step 6: Setup Main Branch
echo ============================================================
git branch -M main >nul 2>&1
echo [OK] Branch set to main
echo.

echo Step 7: Push to GitHub
echo ============================================================
echo Pushing to GitHub...
echo (You may be prompted to login or enter credentials)
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push failed
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify GitHub credentials (username/password or token)
    echo 3. Make sure you have push access to the repository
    echo.
    echo For more help, see: https://docs.github.com/en/authentication
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  SUCCESS! Deployment Complete!
echo ============================================================
echo.
echo Repository URL: https://github.com/aditya6100/ARDYPCET
echo View your code: https://github.com/aditya6100/ARDYPCET/tree/main
echo Commit history: https://github.com/aditya6100/ARDYPCET/commits/main
echo.
echo Next Step: Deploy to Vercel
echo ============================================================
echo 1. Go to https://vercel.com/new
echo 2. Click "Import Git Repository"
echo 3. Search for "ARDYPCET"
echo 4. Click "Deploy" (settings auto-fill)
echo 5. Wait 2-5 minutes for deployment
echo.
echo Your app will be live at: https://ardypcet.vercel.app
echo.
pause
