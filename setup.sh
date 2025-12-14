#!/bin/bash

# Digital Cafe Order Queue - Complete Setup Script
# This script automates the entire setup process including:
# - Installing Homebrew (macOS)
# - Installing PostgreSQL
# - Installing Node.js
# - Setting up the database
# - Installing project dependencies
# - Seeding the database with sample data

echo "🍵 Digital Cafe Order Queue - Automated Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

#!/bin/bash

# Digital Cafe Order Queue - Complete Setup Script
# This script automates the entire setup process including:
# - Installing package managers (Homebrew on macOS, winget/choco on Windows, apt on Linux)
# - Installing PostgreSQL
# - Installing Node.js
# - Setting up the database
# - Installing project dependencies
# - Seeding the database with sample data

echo "🍵 Digital Cafe Order Queue - Automated Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Detect operating system
detect_os() {
    case "$OSTYPE" in
        "linux-gnu"*)
            if command -v apt-get &> /dev/null; then
                echo "linux-apt"
            elif command -v yum &> /dev/null; then
                echo "linux-yum"
            else
                echo "linux-unknown"
            fi
            ;;
        "darwin"*)
            echo "macos"
            ;;
        "msys"*)
            echo "windows"
            ;;
        "cygwin"*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

OS_TYPE=$(detect_os)
print_info "Detected OS: $OS_TYPE"

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    print_info "PostgreSQL not found. Installing PostgreSQL..."
    case "$OS_TYPE" in
        "macos")
            brew install postgresql@14
            if [ $? -eq 0 ]; then
                print_success "PostgreSQL installed successfully"
            else
                print_error "Failed to install PostgreSQL"
                exit 1
            fi
            ;;
        "windows")
            if [ "$PACKAGE_MANAGER" = "winget" ]; then
                winget install --id PostgreSQL.PostgreSQL --version 14.2
            elif [ "$PACKAGE_MANAGER" = "choco" ]; then
                choco install postgresql14
            fi
            if [ $? -eq 0 ]; then
                print_success "PostgreSQL installed successfully"
            else
                print_error "Failed to install PostgreSQL"
                exit 1
            fi
            ;;
        "linux-apt")
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            if [ $? -eq 0 ]; then
                print_success "PostgreSQL installed successfully"
            else
                print_error "Failed to install PostgreSQL"
                exit 1
            fi
            ;;
        *)
            print_error "Unsupported OS for PostgreSQL installation"
            exit 1
            ;;
    esac
else
    print_success "PostgreSQL is installed"
fi

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_info "Node.js not found. Installing Node.js..."
    case "$OS_TYPE" in
        "macos")
            brew install node
            if [ $? -eq 0 ]; then
                print_success "Node.js installed successfully"
            else
                print_error "Failed to install Node.js"
                exit 1
            fi
            ;;
        "windows")
            if [ "$PACKAGE_MANAGER" = "winget" ]; then
                winget install --id OpenJS.NodeJS
            elif [ "$PACKAGE_MANAGER" = "choco" ]; then
                choco install nodejs
            fi
            if [ $? -eq 0 ]; then
                print_success "Node.js installed successfully"
            else
                print_error "Failed to install Node.js"
                exit 1
            fi
            ;;
        "linux-apt")
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
            if [ $? -eq 0 ]; then
                print_success "Node.js installed successfully"
            else
                print_error "Failed to install Node.js"
                exit 1
            fi
            ;;
        *)
            print_error "Unsupported OS for Node.js installation"
            exit 1
            ;;
    esac
else
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed ($NODE_VERSION)"
fi

# Start PostgreSQL service
echo ""
echo "Starting PostgreSQL..."
case "$OS_TYPE" in
    "macos")
        # Initialize PostgreSQL if needed
        if [ ! -d "/opt/homebrew/var/postgresql@14" ]; then
            print_info "Initializing PostgreSQL database cluster..."
            /opt/homebrew/bin/initdb /opt/homebrew/var/postgresql@14
            print_success "PostgreSQL database cluster initialized"
        fi
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
        print_success "PostgreSQL service started"
        ;;
    "windows")
        # On Windows, PostgreSQL service should start automatically after installation
        # Try to start it manually if needed
        if command -v net &> /dev/null; then
            net start postgresql-x64-14 2>/dev/null || print_info "PostgreSQL service may already be running"
        fi
        print_success "PostgreSQL service started (or was already running)"
        ;;
    "linux-apt")
        sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null
        print_success "PostgreSQL service started"
        ;;
    *)
        print_info "Please ensure PostgreSQL is running on your system"
        ;;
esac

# Get current user for PostgreSQL connection
case "$OS_TYPE" in
    "windows")
        DB_USER="postgres"
        ;;
    *)
        DB_USER=$(whoami)
        ;;
esac
print_info "Using PostgreSQL user: $DB_USER"

# Create database
echo ""
echo "Creating database..."
# Check if database already exists
DB_EXISTS=$(psql postgres -tAc "SELECT 1 FROM pg_database WHERE datname='cafe_orders'" 2>/dev/null)
if [ "$DB_EXISTS" = "1" ]; then
    print_success "Database 'cafe_orders' already exists"
else
    psql postgres -c "CREATE DATABASE cafe_orders;" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Database 'cafe_orders' created"
    else
        print_error "Failed to create database. Please create it manually:"
        echo "  psql postgres -c \"CREATE DATABASE cafe_orders;\""
        exit 1
    fi
fi

# Setup Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

# Create or update .env file with correct database URL
echo "Configuring environment variables..."
cat > .env << EOF
DATABASE_URL="postgresql://$DB_USER@localhost:5432/cafe_orders?schema=public"
PORT=5000
NODE_ENV=development
EOF
print_success "Environment variables configured"

echo "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

echo "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

echo "Running database migrations..."
npx prisma migrate dev --name init
print_success "Database migrations completed"

echo "Seeding database with sample data..."
npm run seed
print_success "Database seeded with menu items and admin user"

# Setup Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ../frontend

echo "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Return to root directory
cd ..

# Print success message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Setup completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting the application automatically..."
echo ""

# Start backend server in background
echo "Starting backend server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
print_success "Backend server started (PID: $BACKEND_PID)"

# Start frontend server in background
echo "Starting frontend server..."
cd ../frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
print_success "Frontend server started (PID: $FRONTEND_PID)"

# Return to root directory
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Application is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access the application:"
echo "   Customer View: http://localhost:3000"
echo "   Admin Login:   http://localhost:3000/admin/login"
echo ""
echo "👤 Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 Server PIDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "📚 Read README.md for complete documentation"
echo ""
print_success "Happy coding! ☕"
