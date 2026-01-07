#!/bin/bash

# Attendance System Setup Script for Raspberry Pi 4
# This script sets up and starts the attendance tracking system

set -e

echo "========================================="
echo " Attendance System - Setup & Start"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Edit the .env file and set your:"
        echo "   - MYSQL_ROOT_PASSWORD"
        echo "   - MYSQL_PASSWORD"
        echo "   - API_TOKEN"
        echo "   - MANAGEMENT_PASSWORD"
        echo "   - GITHUB_USERNAME (for auto-updates)"
        echo ""
        read -p "Press Enter after you've edited .env file..."
    else
        echo "✗ .env.example not found!"
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed!"
    echo "  Install Docker with: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "✗ Docker Compose is not installed!"
    exit 1
fi

echo "✓ Docker is installed"
echo ""

# Pull latest images from GitHub
echo "Pulling latest images from GitHub Container Registry..."
source .env
if [ -n "$GITHUB_USERNAME" ]; then
    echo "Using GitHub username: $GITHUB_USERNAME"
    docker-compose pull || echo "⚠️  Could not pull images (will build locally)"
else
    echo "⚠️  GITHUB_USERNAME not set in .env - skipping image pull"
fi
echo ""

# Start services
echo "Starting services..."
docker-compose up -d

echo ""
echo "========================================="
echo " Services Starting..."
echo "========================================="
echo ""

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

echo ""
echo "========================================="
echo " Setup Complete!"
echo "========================================="
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost:3000"
echo ""
echo "📊 View logs: ./logs.sh"
echo "🛑 Stop system: ./stop.sh"
echo ""
echo "💡 Watchtower will automatically check for updates every hour"
echo ""
