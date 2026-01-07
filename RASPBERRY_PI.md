# Raspberry Pi 4 Deployment Guide

Complete guide for deploying the attendance system on Raspberry Pi 4 with RFID reader and LCD display.

## 📋 Table of Contents

- [Hardware Setup](#hardware-setup)
- [Software Installation](#software-installation)
- [System Configuration](#system-configuration)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## 🔧 Hardware Setup

### Required Components

1. **Raspberry Pi 4** (2GB RAM minimum, 4GB recommended)
2. **MicroSD Card** (16GB minimum, Class 10)
3. **MFRC522 RFID Reader Module**
4. **16x2 I2C LCD Display** with PCF8574 backpack
5. **RFID Cards/Tags** (13.56MHz, Mifare compatible)
6. **Power Supply** (5V 3A USB-C for Pi 4)
7. **Jumper Wires** (Female-to-Female)

### Wiring Diagram

#### MFRC522 RFID Reader (SPI Interface)

```
MFRC522    Raspberry Pi 4
--------   ---------------
SDA    ->  GPIO 8  (Pin 24)
SCK    ->  GPIO 11 (Pin 23)
MOSI   ->  GPIO 10 (Pin 19)
MISO   ->  GPIO 9  (Pin 21)
IRQ    ->  Not connected
GND    ->  GND     (Pin 6)
RST    ->  GPIO 25 (Pin 22)
3.3V   ->  3.3V    (Pin 1)
```

#### I2C LCD Display

```
LCD Pin    Raspberry Pi 4
--------   ---------------
VCC    ->  5V      (Pin 2 or 4)
GND    ->  GND     (Pin 9 or 14)
SDA    ->  GPIO 2  (Pin 3)
SCL    ->  GPIO 3  (Pin 5)
```

### Physical Assembly

1. **Power off** the Raspberry Pi before connecting any components
2. Connect the RFID reader following the SPI wiring diagram
3. Connect the LCD display following the I2C wiring diagram
4. Double-check all connections before powering on
5. Use a breadboard or HAT if managing multiple components

## 💿 Software Installation

### Step 1: Install Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Flash **Raspberry Pi OS (64-bit)** to your microSD card
3. Enable SSH during setup (recommended)
4. Configure WiFi if not using Ethernet
5. Boot the Raspberry Pi

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Enable SPI and I2C

```bash
sudo raspi-config
```

Navigate through the menu:
- **3 Interface Options**
  - **I4 SPI** → Enable
  - **I5 I2C** → Enable
- **Finish** and reboot

Verify interfaces are enabled:
```bash
lsmod | grep spi
lsmod | grep i2c
ls /dev/i2c* /dev/spi*
```

You should see `/dev/i2c-1` and `/dev/spidev0.0`, `/dev/spidev0.1`

### Step 4: Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Important**: Log out and back in for group changes to take effect, or run:
```bash
newgrp docker
```

Verify Docker installation:
```bash
docker --version
docker-compose --version
```

### Step 5: Test I2C LCD Address

Find your LCD's I2C address:
```bash
sudo apt install -y i2c-tools
sudo i2cdetect -y 1
```

You should see something like:
```
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
20: -- -- -- -- -- -- -- 27 -- -- -- -- -- -- -- -- 
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
```

The `27` indicates address `0x27` (most common). Update `.env` if different:
```env
LCD_I2C_ADDRESS=0x27
```

## ⚙️ System Configuration

### Clone Repository

```bash
cd ~
git clone https://github.com/yourusername/attendance.git
cd attendance
```

### Configure Environment

1. **Copy example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit configuration**:
   ```bash
   nano .env
   ```

3. **Update these values**:
   ```env
   # GitHub username for pulling Docker images
   GITHUB_USERNAME=yourusername
   
   # Database passwords (change these!)
   DB_ROOT_PASSWORD=your_secure_root_password
   DB_PASSWORD=your_secure_database_password
   
   # API security (change these!)
   JWT_SECRET=your_random_jwt_secret_here_make_it_long
   MANAGEMENT_PASSWORD=your_admin_password
   API_TOKEN=your_random_api_token_here
   
   # LCD configuration (verify with i2cdetect)
   LCD_I2C_ADDRESS=0x27
   LCD_COLS=16
   LCD_ROWS=2
   
   # Port configuration
   FRONTEND_PORT=80
   BACKEND_PORT=3000
   ```

4. **Update frontend API token**:
   ```bash
   nano frontend/js/api.js
   ```
   
   Change the token to match your `.env`:
   ```javascript
   const API_TOKEN = 'your_random_api_token_here'; // MUST match .env
   ```

### Make Scripts Executable

```bash
chmod +x setup.sh stop.sh logs.sh
```

### Initial Setup

```bash
./setup.sh
```

This will:
1. Pull Docker images from GitHub
2. Build the RFID service locally
3. Start all containers
4. Initialize the database
5. Start the RFID/LCD hardware service
6. Enable automatic updates via Watchtower

### Verify System Status

```bash
docker ps
```

You should see 6 running containers:
- `attendance-db` (MySQL)
- `attendance-backend` (Node.js API)
- `attendance-frontend` (Nginx)
- `attendance-rfid` (Python RFID/LCD service)
- `attendance-watchtower` (Auto-updater)

Check logs:
```bash
./logs.sh
# Choose option 5 to see RFID service logs
```

## 🧪 Testing Hardware

### Test RFID Reader

The RFID service runs in simulation mode if hardware isn't detected. Check logs:

```bash
docker logs attendance-rfid
```

Expected output with hardware:
```
✓ MFRC522 RFID reader initialized
✓ LCD 16x2 initialized at address 0x27
Attendance system running...
```

Without hardware (simulation mode):
```
Warning: MFRC522 or RPi.GPIO not available. Running in simulation mode.
Warning: RPLCD not available. Running in simulation mode.
```

### Test LCD Display

The LCD should show:
```
Line 1: Scan RFID Card
Line 2: Ready...
```

### Test Complete Flow

1. Scan an RFID card near the reader
2. LCD should show "Processing..."
3. If user doesn't exist, LCD shows "User Not Found"
4. If user exists, LCD shows "Signed In" or "Signed Out"
5. Web interface updates in real-time

## 🔍 Troubleshooting

### LCD Not Detected

**Problem**: LCD shows garbled text or nothing

**Solutions**:
1. Check I2C address:
   ```bash
   sudo i2cdetect -y 1
   ```
2. Verify wiring (especially SDA/SCL)
3. Check LCD backpack solder joints
4. Try different I2C address in `.env`
5. Test with Python directly:
   ```bash
   docker exec -it attendance-rfid python3 lcd_display.py
   ```

### RFID Reader Not Working

**Problem**: Cards not detected

**Solutions**:
1. Verify SPI is enabled:
   ```bash
   lsmod | grep spi
   ls /dev/spidev*
   ```
2. Check wiring (especially SDA/MOSI/MISO/SCK)
3. Verify 3.3V power (not 5V!)
4. Test with Python directly:
   ```bash
   docker exec -it attendance-rfid python3 rfid_reader.py
   ```
5. Try different RFID cards (must be 13.56MHz)

### Permission Denied Errors

**Problem**: Cannot access `/dev/gpiomem` or `/dev/i2c-1`

**Solutions**:
1. Add user to groups:
   ```bash
   sudo usermod -aG gpio,i2c $USER
   ```
2. Reboot or re-login
3. Check container has `privileged: true` in docker-compose.yml

### Backend Not Connecting

**Problem**: RFID service shows "Waiting for backend API..."

**Solutions**:
1. Check backend container is running:
   ```bash
   docker ps | grep backend
   ```
2. Check backend logs:
   ```bash
   docker logs attendance-backend
   ```
3. Verify database is healthy:
   ```bash
   docker logs attendance-db
   ```
4. Test backend health:
   ```bash
   curl http://localhost:3000/health
   ```

### Watchtower Not Updating

**Problem**: Containers not updating automatically

**Solutions**:
1. Check Watchtower logs:
   ```bash
   docker logs attendance-watchtower
   ```
2. Verify labels in docker-compose.yml
3. Check GitHub packages are public
4. Manually trigger update:
   ```bash
   docker restart attendance-watchtower
   ```

## 🛠️ Maintenance

### View Logs

```bash
./logs.sh
```

Choose which service:
1. All services
2. Backend API
3. Frontend
4. Database
5. RFID Service
6. Watchtower

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart rfid-service
```

### Update Manually

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d
```

### Backup Database

```bash
# Export database
docker exec attendance-db mysqldump -u root -p$DB_ROOT_PASSWORD attendance > backup.sql

# Restore database
docker exec -i attendance-db mysql -u root -p$DB_ROOT_PASSWORD attendance < backup.sql
```

### Stop System

```bash
./stop.sh
```

### Remove Everything (including data)

```bash
docker-compose down -v
```

**⚠️ Warning**: This deletes all attendance records!

## 🚀 Performance Optimization

### Reduce Memory Usage

Edit `docker-compose.yml` and add memory limits:

```yaml
services:
  backend:
    mem_limit: 512m
  rfid-service:
    mem_limit: 256m
```

### Start on Boot

Create systemd service:

```bash
sudo nano /etc/systemd/system/attendance.service
```

Add:
```ini
[Unit]
Description=Attendance Tracking System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/attendance
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=pi

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable attendance
sudo systemctl start attendance
```

### Monitor System Resources

```bash
# Check CPU/Memory
htop

# Check Docker stats
docker stats

# Check disk space
df -h
```

## 📞 Support

For issues or questions:
1. Check logs: `./logs.sh`
2. Review troubleshooting section above
3. Check GitHub issues
4. Verify hardware connections
5. Test components individually

## 📝 Notes

- System checks for updates every hour via Watchtower
- LCD backlight can be controlled in `lcd_display.py`
- RFID read distance is ~3-5cm depending on card and antenna
- Use `docker-compose logs -f rfid-service` for real-time debugging
- Python modules run in simulation mode if hardware unavailable (for testing)
