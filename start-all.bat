@echo off
cd /d "%~dp0"
chcp 65001 > nul
echo ===================================================
echo   🎮 Starting Game Top-up & Gacha Vault Platform
echo ===================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "Backend Server (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend & Backoffice (Port 5173)...
start "Frontend & Admin (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   ✅ All services are starting!
echo.
echo   🌐 Storefront (หน้าร้านค้า/ผู้เล่น): http://localhost:5173
echo   🎰 Gacha Vault (ตู้สุ่มกาชา):       http://localhost:5173/gacha
echo   ⚙️ Backoffice (หลังบ้านแอดมิน):     http://localhost:5173/admin
echo   🔌 Backend API (พอร์ต 5000):        http://localhost:5000
echo.
echo   👤 บัญชีทดสอบ:
echo      - ผู้เล่น (Player): player1 / User@123456
echo      - แอดมิน (Admin):   admin / Admin@123456
echo ===================================================
pause
