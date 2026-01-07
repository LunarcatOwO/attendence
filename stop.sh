#!/bin/bash

# Attendance System Stop Script
# Stops all Docker containers for the attendance system

echo "========================================="
echo " Attendance System - Stop"
echo "========================================="
echo ""

echo "Stopping all services..."
docker-compose down

echo ""
echo "✓ All services stopped"
echo ""
echo "To start again, run: ./setup.sh"
echo "To remove all data (including database), run: docker-compose down -v"
echo ""
