#!/bin/bash

# Attendance System Logs Viewer
# View logs from running containers

echo "========================================="
echo " Attendance System - Logs"
echo "========================================="
echo ""
echo "Select which logs to view:"
echo ""
echo "  1) All services"
echo "  2) Backend API"
echo "  3) Frontend (Nginx)"
echo "  4) Database (MySQL)"
echo "  5) RFID Service"
echo "  6) Watchtower (Auto-updater)"
echo ""
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo "Showing logs from all services (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    2)
        echo "Showing backend logs (Ctrl+C to exit)..."
        docker-compose logs -f backend
        ;;
    3)
        echo "Showing frontend logs (Ctrl+C to exit)..."
        docker-compose logs -f frontend
        ;;
    4)
        echo "Showing database logs (Ctrl+C to exit)..."
        docker-compose logs -f database
        ;;
    5)
        echo "Showing RFID service logs (Ctrl+C to exit)..."
        docker-compose logs -f rfid-service
        ;;
    6)
        echo "Showing Watchtower logs (Ctrl+C to exit)..."
        docker-compose logs -f watchtower
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
