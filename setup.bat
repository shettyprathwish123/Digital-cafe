@echo off
REM Digital Cafe Order Queue - Windows Setup Script
REM This script automates the entire setup process for Windows including:
REM - Installing PostgreSQL
REM - Installing Node.js
REM - Setting up the database
REM - Installing project dependencies
REM - Seeding the database with sample data

echo 🍵 Digital Cafe Order Queue - Windows Setup
echo ==============================================
echo.

REM Check if winget is available
where winget >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ winget not found. Please install Windows Package Manager (winget) first.
    echo Download from: https://docs.microsoft.com/en-us/windows/package-manager/winget/
    pause
    exit /b 1
)

echo ✅ winget is available

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  PostgreSQL not found. Installing PostgreSQL...
    winget install --id PostgreSQL.PostgreSQL --version 14.2 --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo ❌ Failed to install PostgreSQL
        pause
        exit /b 1
    )
    echo ✅ PostgreSQL installed successfully
) else (
    echo ✅ PostgreSQL is installed
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  Node.js not found. Installing Node.js...
    winget install --id OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Node.js
        pause
        exit /b 1
    )
    echo ✅ Node.js installed successfully
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✅ Node.js is installed (%NODE_VERSION%)
)

REM Start PostgreSQL service
echo.
echo Starting PostgreSQL...
net start postgresql-x64-14 >nul 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  PostgreSQL service may already be running or requires manual start
) else (
    echo ✅ PostgreSQL service started
)

REM Create database
echo.
echo Creating database...
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='cafe_orders';" | findstr "1" >nul
if %errorlevel% equ 0 (
    echo ✅ Database 'cafe_orders' already exists
) else (
    psql -U postgres -c "CREATE DATABASE cafe_orders;"
    if %errorlevel% equ 0 (
        echo ✅ Database 'cafe_orders' created
    ) else (
        echo ❌ Failed to create database. Please create it manually:
        echo   psql -U postgres -c "CREATE DATABASE cafe_orders;"
        pause
        exit /b 1
    )
)

REM Setup Backend
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Setting up Backend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd backend

REM Create .env file
echo Configuring environment variables...
echo DATABASE_URL="postgresql://postgres@localhost:5432/cafe_orders?schema=public" > .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
echo ✅ Environment variables configured

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo Generating Prisma client...
call npx prisma generate
echo ✅ Prisma client generated

echo Running database migrations...
call npx prisma migrate deploy
echo ✅ Database migrations completed

echo Seeding database with sample data...
call npm run seed
echo ✅ Database seeded with menu items and admin user

REM Setup Frontend
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Setting up Frontend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd ../frontend

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Return to root directory
cd ..

REM Print success message
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Setup completed successfully!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🚀 Starting the application automatically...
echo.

REM Start backend server in background
echo Starting backend server...
start /B cmd /C "cd backend && npm run dev > backend.log 2>&1"

REM Start frontend server in background
echo Starting frontend server...
start /B cmd /C "cd frontend && npm run dev > frontend.log 2>&1"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Application is now running!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Access the application:
echo    Customer View: http://localhost:3000
echo    Admin Login:   http://localhost:3000/admin/login
echo.
echo 👤 Admin Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo 📊 Server PIDs: Check Task Manager for node processes
echo.
echo 🛑 To stop servers: Use Task Manager to end node processes
echo.
echo 📝 Logs:
echo    Backend:  type backend.log
echo    Frontend: type frontend.log
echo.
echo 📚 Read README.md for complete documentation
echo.
echo ✅ Happy coding! ☕
echo.
pause

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing PostgreSQL...
    choco install postgresql --version=14.10 -y --params='/Password:postgres'
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install PostgreSQL
        echo Please install it manually from https://www.postgresql.org/download/
        pause
        exit /b 1
    )
    REM Refresh environment variables
    call refreshenv.cmd
    echo [OK] PostgreSQL installed
) else (
    echo [OK] PostgreSQL is installed
)

REM Start PostgreSQL service
echo.
echo Starting PostgreSQL service...
net start postgresql-x64-14 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Could not start PostgreSQL service automatically
    echo Please start it manually from Services.msc
)

REM Create database
echo.
echo Creating database...
REM Check if database already exists
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='cafe_orders';" | findstr "1" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database 'cafe_orders' already exists
) else (
    psql -U postgres -c "CREATE DATABASE cafe_orders;"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create database
        echo Please create it manually: psql -U postgres -c "CREATE DATABASE cafe_orders;"
        pause
        exit /b 1
    )
    echo [OK] Database 'cafe_orders' created
)

REM Setup Backend
echo.
echo ======================================
echo Setting up Backend...
echo ======================================
cd backend

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

echo Generating Prisma client...
call npx prisma generate
echo [OK] Prisma client generated

echo Running database migrations...
call npx prisma migrate dev --name init
echo [OK] Database migrations completed

echo Seeding database...
call npm run seed
echo [OK] Database seeded

REM Setup Frontend
echo.
echo ======================================
echo Setting up Frontend...
echo ======================================
cd ..\frontend

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

REM Print success message
echo.
echo ======================================
echo Setup completed successfully!
echo ======================================
echo.
echo Starting the application automatically...
echo.

REM Start backend server in background
echo Starting backend server...
cd backend
start /B npm run dev > ..\backend.log 2>&1
echo [OK] Backend server started

REM Start frontend server in background
echo Starting frontend server...
cd ..\frontend
start /B npm run dev > ..\frontend.log 2>&1
echo [OK] Frontend server started

REM Return to root directory
cd ..

echo.
echo ======================================
echo Application is now running!
echo ======================================
echo.
echo Access the application:
echo   Customer View: http://localhost:3000
echo   Admin Login:   http://localhost:3000/admin/login
echo.
echo Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Server logs:
echo   Backend:  type backend.log
echo   Frontend: type frontend.log
echo.
echo To stop servers: Check Task Manager for node.exe processes
echo.
echo Read README.md for complete documentation
echo.
echo Happy coding!
pause
