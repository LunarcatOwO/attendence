# Modern RFID Attendance Tracking System for Raspberry Pi 4

A modernized, containerized RFID attendance tracking system using Node.js, Express, MySQL, Docker, and Python for hardware integration on Raspberry Pi 4.

## ✨ Features

- **Modern Stack**: Node.js + Express backend, vanilla JavaScript frontend
- **Docker Support**: Fully containerized with Docker Compose for ARM64/Raspberry Pi 4
- **Auto-Updates**: Watchtower automatically pulls latest images from GitHub
- **Hardware Integration**: Python service for MFRC522 RFID reader and I2C LCD display
- **RESTful API**: Clean API architecture with proper authentication
- **Real-time Updates**: Live attendance tracking with auto-refresh
- **Responsive Design**: Modern UI with dark/light theme support
- **Management Portal**: Secure admin interface for user management
- **Season Support**: Track attendance across multiple seasons/periods
- **Historical Data**: View and analyze past attendance records

## 🔧 Hardware Requirements

- **Raspberry Pi 4** (ARM64)
- **MFRC522 RFID Reader** (connected via SPI)
- **16x2 I2C LCD Display** (PCF8574 backpack, default address 0x27)
- **RFID Cards/Tags** (13.56MHz)

### Hardware Connections

#### RFID Reader (MFRC522) - SPI Interface
| MFRC522 Pin | Raspberry Pi Pin |
|-------------|------------------|
| SDA         | GPIO 8 (Pin 24)  |
| SCK         | GPIO 11 (Pin 23) |
| MOSI        | GPIO 10 (Pin 19) |
| MISO        | GPIO 9 (Pin 21)  |
| GND         | GND (Pin 6)      |
| RST         | GPIO 25 (Pin 22) |
| 3.3V        | 3.3V (Pin 1)     |

#### LCD Display - I2C Interface
| LCD Pin | Raspberry Pi Pin |
|---------|------------------|
| VCC     | 5V (Pin 2)       |
| GND     | GND (Pin 9)      |
| SDA     | GPIO 2 (Pin 3)   |
| SCL     | GPIO 3 (Pin 5)   |

## 🏗️ Architecture

```
attendence/
├── backend/               # Node.js/Express API server
│   ├── config/           # Database configuration
│   ├── middleware/       # Authentication & validation
│   ├── routes/          # API endpoints
│   ├── Dockerfile       # Backend container
│   └── server.js        # Main application entry
├── frontend/            # Static web application
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript modules
│   └── index.html      # Main HTML file
├── rfid-service/       # Python RFID/LCD service
│   ├── main.py         # Main service entry
│   ├── rfid_reader.py  # RFID reader module
│   ├── lcd_display.py  # LCD display module
│   ├── Dockerfile      # Python service container
│   └── requirements.txt # Python dependencies
├── database/           # Database initialization
│   └── init.sql        # Schema and setup
├── nginx/              # Nginx configuration
├── .github/            # GitHub Actions workflows
│   └── workflows/
│       └── docker-build.yml  # Auto-build ARM64 images
├── docker-compose.yml  # Docker orchestration
└── *.sh                # Linux shell scripts
```

## 🚀 Quick Start on Raspberry Pi 4

### Prerequisites

1. **Raspberry Pi OS** (64-bit recommended)
2. **Docker** installed:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
3. **Docker Compose** installed (usually comes with Docker)
4. **Enable SPI and I2C**:
   ```bash
   sudo raspi-config
   # Navigate to: Interface Options -> SPI -> Enable
   # Navigate to: Interface Options -> I2C -> Enable
   sudo reboot
   ```

### Installation

1. **Clone this repository** to your Raspberry Pi:
   ```bash
   git clone https://github.com/yourusername/attendance.git
   cd attendance
   ```

2. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file** and update all passwords and secrets:
   ```bash
   nano .env
   ```
   
   Update these values:
   ```env
   GITHUB_USERNAME=yourusername          # Your GitHub username for image pulling
   DB_ROOT_PASSWORD=your_secure_root_password
   DB_PASSWORD=your_secure_db_password
   JWT_SECRET=your_jwt_secret_key
   MANAGEMENT_PASSWORD=your_admin_password
   API_TOKEN=your_api_token
   LCD_I2C_ADDRESS=0x27                  # Change if your LCD uses different address
   ```

4. **Update the API token in frontend**:
   Edit `frontend/js/api.js` and set the `API_TOKEN` to match your `.env` file:
   ```javascript
   const API_TOKEN = 'your_api_token'; // Must match .env
   ```

5. **Make scripts executable**:
   ```bash
   chmod +x setup.sh stop.sh logs.sh
   ```

6. **Start the application**:
   ```bash
   ./setup.sh
   ```

   The setup script will:
   - Pull latest images from GitHub Container Registry
   - Start all Docker containers
   - Initialize the database
   - Start the RFID/LCD service
   - Enable Watchtower for auto-updates

7. **Access the application**:
   - Frontend: http://raspberrypi.local (or http://YOUR_PI_IP)
   - Backend API: http://raspberrypi.local:3000
   - Health Check: http://raspberrypi.local:3000/health

### Auto-Updates with Watchtower

The system includes Watchtower which automatically:
- Checks for new images on GitHub Container Registry every hour
- Pulls and updates containers with new versions
- Restarts containers with zero downtime
- Keeps your system up to date automatically

To manually trigger an update:
```bash
docker restart attendance-watchtower
```

### Managing the System

- **Stop all services**: `./stop.sh`
- **View logs**: `./logs.sh` (choose which service to view)
- **Restart a service**: `docker-compose restart <service-name>`
- **Update images manually**: `docker-compose pull && docker-compose up -d`

## 📖 Usage

### Web Interface

1. **View Active Users**: The main page shows all currently signed-in users with live time tracking
2. **Management Access**: Click "Manage" and enter your management password
3. **Add Users**: Click the "+" button to add new users with RFID keys
4. **View Data**: Switch to "Data & Reports" tab to see historical attendance
5. **Sign Out**: Click on any active user (as manager) to see details and sign out

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Management login
- `GET /api/auth/verify` - Verify credentials

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/logged-in` - Get logged-in users
- `POST /api/users` - Create user (requires management auth)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Attendance
- `POST /api/attendance/sign-in` - Sign in via RFID
- `POST /api/attendance/sign-out` - Sign out user
- `POST /api/attendance/sign-out-all` - Sign out all users

#### Seasons
- `GET /api/seasons` - Get all seasons
- `GET /api/seasons/:date` - Get season data
- `POST /api/seasons` - Create new season

#### Records
- `GET /api/records` - Get attendance records
- `GET /api/records/:id` - Get specific record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### API Authentication

All API requests require an API token in the header:
```bash
curl -H "X-API-Token: your_api_token" http://localhost:3000/api/users
```

Management endpoints also require a management password:
```bash
curl -H "X-API-Token: your_api_token" \
     -H "X-Management-Password: your_admin_password" \
     -X POST http://localhost:3000/api/users \
     -d '{"name":"John Doe","rfidKey":"1234567890"}'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_ROOT_PASSWORD` | MySQL root password | - |
| `DB_NAME` | Database name | attendance |
| `DB_USER` | Database user | attendance_user |
| `DB_PASSWORD` | Database password | - |
| `NODE_ENV` | Environment (production/development) | production |
| `BACKEND_PORT` | Backend API port | 3000 |
| `FRONTEND_PORT` | Frontend web port | 8080 |
| `JWT_SECRET` | JWT signing secret | - |
| `MANAGEMENT_PASSWORD` | Admin password | - |
| `API_TOKEN` | API access token | - |
| `TIMEZONE_OFFSET` | Timezone offset (e.g., -5:00) | 0:00 |

### Database Schema

The system uses three main tables:

- **users**: Store user information and current attendance status
- **pastseasons**: Archive historical season data
- **records**: Log individual attendance sessions

## 🛠️ Development

### Local Development (without Docker)

1. **Start MySQL**
   ```bash
   # Use Docker just for MySQL
   docker run -d \
     -e MYSQL_ROOT_PASSWORD=password \
     -e MYSQL_DATABASE=attendance \
     -e MYSQL_USER=attendance_user \
     -e MYSQL_PASSWORD=password \
     -p 3306:3306 \
     mysql:8.0
   ```

2. **Initialize database**
   ```bash
   mysql -h localhost -u root -p < database/init.sql
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Create `.env` file in backend/**
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=attendance
   DB_USER=attendance_user
   DB_PASSWORD=password
   JWT_SECRET=dev_secret
   MANAGEMENT_PASSWORD=admin
   API_TOKEN=dev_token
   ```

5. **Start backend**
   ```bash
   npm run dev  # Uses nodemon for auto-reload
   ```

6. **Serve frontend**
   ```bash
   # Use any static file server, e.g.:
   npx serve frontend
   # Or Python:
   cd frontend && python -m http.server 8080
   ```

### Building for Production

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend
```

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Change all default passwords** in `.env` before deployment
2. **Use strong, unique passwords** for production
3. **Update API_TOKEN** in both `.env` and `frontend/js/api.js`
4. **Use HTTPS** in production (configure reverse proxy)
5. **Implement rate limiting** on your reverse proxy
6. **Regular backups** of the database volume
7. **Keep Docker images updated**

This system is designed for **internal use** and assumes a trusted network environment.

## 📊 Creating a New Season

To archive the current season and start fresh:

```bash
# Using the API
curl -H "X-API-Token: your_api_token" \
     -H "X-Management-Password: your_admin_password" \
     -X POST http://localhost:3000/api/seasons \
     -H "Content-Type: application/json" \
     -d '{"seasonStartDate":"2024-01-01"}'
```

This will:
- Copy all current user hours to `pastseasons` table
- Reset all user hours to 0
- Keep all user accounts active

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
docker-compose ps

# View MySQL logs
docker-compose logs database

# Access MySQL directly
docker-compose exec database mysql -u root -p
```

### Backend Not Starting
```bash
# View backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend Not Loading
```bash
# Check Nginx logs
docker-compose logs frontend

# Verify Nginx config
docker-compose exec frontend nginx -t
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## 📝 Differences from Original System

### Improvements
- ✅ Modern JavaScript (ES6+ modules)
- ✅ Docker containerization
- ✅ RESTful API architecture
- ✅ Better code organization
- ✅ Improved security (token-based auth)
- ✅ Responsive modern UI
- ✅ Dark/light theme
- ✅ Better error handling
- ✅ Organized file structure

### Changes
- 🔄 PHP → Node.js/Express
- 🔄 Mixed files → Separated frontend/backend
- 🔄 Direct MySQL access → Connection pooling
- 🔄 Inline SQL → Prepared statements
- 🔄 No authentication → Token + password auth

## 📄 License

This project maintains the same license as the original attendance system.

## 🤝 Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📮 Support

For issues or questions:
- Check the troubleshooting section
- Review Docker logs
- Verify environment configuration

---

Built with ❤️ using Node.js, Express, MySQL, and Docker
