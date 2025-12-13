#!/bin/bash

echo "🚀 Typing Tournament - Quick Start Script"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please create .env.local with your credentials"
    echo "See .env.example for reference"
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found"

if ! command_exists pnpm; then
    echo "⚠️  pnpm not found. Installing..."
    npm install -g pnpm
fi
echo "✅ pnpm found"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install contract dependencies
echo "📄 Installing contract dependencies..."
cd contracts
npm install
cd ..
echo "✅ Contract dependencies installed"
echo ""

# Install server dependencies
echo "🖥️  Installing server dependencies..."
cd server
npm install
cd ..
echo "✅ Server dependencies installed"
echo ""

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
pnpm install
echo "✅ Frontend dependencies installed"
echo ""

echo "=========================================="
echo "✨ Setup complete!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Deploy the smart contract:"
echo "   cd contracts && npm run deploy"
echo ""
echo "2. Copy the contract address to .env.local"
echo ""
echo "3. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   pnpm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
