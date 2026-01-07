# Project Structure Overview

## Directory Structure

```
attendence/
│
├── 📁 backend/                    # Node.js/Express Backend
│   ├── 📁 config/
│   │   └── database.js           # MySQL connection pool
│   ├── 📁 middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── 📁 routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── users.js              # User management endpoints
│   │   ├── attendance.js         # Sign in/out endpoints
│   │   ├── seasons.js            # Season management endpoints
│   │   └── records.js            # Attendance records endpoints
│   ├── Dockerfile                # Backend container definition
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Main Express application
│
├── 📁 frontend/                   # Static Web Application
│   ├── 📁 css/
│   │   ├── styles.css            # Main stylesheet
│   │   └── themes.css            # Theme definitions
│   ├── 📁 js/
│   │   ├── 📁 views/
│   │   │   ├── users.js          # Users view logic
│   │   │   └── data.js           # Data view logic
│   │   ├── api.js                # API client & endpoints
│   │   ├── utils.js              # Utility functions
│   │   ├── managers.js           # State managers
│   │   └── app.js                # Main application entry
│   └── index.html                # Main HTML page
│
├── 📁 database/
│   └── init.sql                  # Database schema & initialization
│
├── 📁 nginx/
│   └── nginx.conf                # Nginx configuration
│
├── 📄 docker-compose.yml         # Service orchestration
├── 📄 .env.example               # Environment template
├── 📄 .gitignore                 # Git ignore rules
├── 📄 package.json               # Project scripts
│
├── 📘 README.md                  # Full documentation
├── 📘 QUICKSTART.md              # Quick start guide
├── 📘 API.md                     # API documentation
├── 📘 STRUCTURE.md               # This file
│
└── 🖥️ Scripts/
    ├── setup.bat                 # Windows setup script
    ├── stop.bat                  # Stop services
    └── logs.bat                  # View logs
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.0
- **ORM**: mysql2 (native driver with promises)
- **Security**: helmet, cors, express-rate-limit
- **Authentication**: Custom token + password auth

### Frontend
- **Language**: Vanilla JavaScript (ES6+ modules)
- **Styling**: Custom CSS with CSS Variables
- **Architecture**: Module-based with View pattern
- **State Management**: LocalStorage + in-memory

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Database**: MySQL 8.0
- **Networking**: Docker bridge network

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     (http://localhost:8080)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx Container                         │
│  - Serves static files (HTML, CSS, JS)                      │
│  - Proxies /api/* to backend                                 │
│  - Port: 80 → Host: 8080                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Container                         │
│  - Express.js REST API                                       │
│  - Authentication & Authorization                            │
│  - Business Logic                                            │
│  - Port: 3000 → Host: 3000                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Container                        │
│  - MySQL 8.0                                                 │
│  - Persistent Volume (db_data)                               │
│  - Port: 3306 → Host: 3306                                   │
└─────────────────────────────────────────────────────────────┘
```

## API Flow

```
Frontend JavaScript → API Client (api.js)
                           ↓
                      HTTP Request
                   (with X-API-Token header)
                           ↓
                    Nginx Proxy (/api/*)
                           ↓
                   Backend Express Server
                           ↓
                  Authentication Middleware
                           ↓
                     Route Handler
                           ↓
                   Database Query (MySQL)
                           ↓
                      JSON Response
                           ↓
                   Frontend Rendering
```

## Data Model

### Users Table
```sql
userId (PK)
├── name
├── hours (total accumulated)
├── rfidKey (unique)
├── loggedIn (boolean)
├── lastLogin
├── lastLogout
├── createdAt
└── updatedAt
```

### PastSeasons Table
```sql
seasonId (PK)
├── userId (FK)
├── hours
├── name
├── seasonStartDate
└── createdAt
```

### Records Table
```sql
recordId (PK)
├── userId (FK)
├── startTime
├── endTime
├── notes
└── createdAt
```

## Security Layers

1. **Network Level**: Docker network isolation
2. **Transport Level**: HTTPS (via reverse proxy in production)
3. **Application Level**: API token authentication
4. **Management Level**: Additional password for admin operations
5. **Database Level**: Separate users with limited permissions
6. **Rate Limiting**: 100 requests per 15 minutes per IP

## Configuration Management

```
Environment Variables (.env)
        ↓
Docker Compose (docker-compose.yml)
        ↓
Container Environment
        ↓
Application Config (backend/config/)
```

## Deployment Flow

```
1. Developer
   ↓
2. Edit .env file
   ↓
3. Run: docker-compose up -d
   ↓
4. Docker Compose reads docker-compose.yml
   ↓
5. Builds/pulls images
   ↓
6. Creates network & volumes
   ↓
7. Starts containers in order:
   - Database (with health check)
   - Backend (waits for DB)
   - Frontend (waits for backend)
   ↓
8. Application ready
```

## Development Workflow

### Making Backend Changes
```
1. Edit files in backend/
2. docker-compose restart backend
3. View logs: docker-compose logs -f backend
```

### Making Frontend Changes
```
1. Edit files in frontend/
2. Refresh browser (no rebuild needed)
```

### Database Changes
```
1. Edit database/init.sql
2. docker-compose down -v (WARNING: deletes data)
3. docker-compose up -d
```

## Performance Considerations

- **Connection Pooling**: MySQL connections are pooled (max 10)
- **Static Asset Caching**: Nginx caches with 1-year expiry
- **Auto-refresh**: Frontend polls every 15 seconds
- **Timer Updates**: Live time updates every 1 second
- **Rate Limiting**: Prevents API abuse

## Monitoring & Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service
```bash
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f frontend
```

### Check Health
```bash
# Backend health
curl http://localhost:3000/health

# Container status
docker-compose ps
```

## Backup Strategy

### Database Backup
```bash
# Export database
docker-compose exec database mysqldump -u root -p attendance > backup.sql

# Restore database
docker-compose exec -T database mysql -u root -p attendance < backup.sql
```

### Volume Backup
```bash
# Backup volume
docker run --rm -v attendance-ea08da439d4f4c39d031c3a7443657a05e01b8cb_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data

# Restore volume
docker run --rm -v attendance-ea08da439d4f4c39d031c3a7443657a05e01b8cb_db_data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /
```

## Scaling Considerations

Current setup is for single-node deployment. For scaling:

1. **Database**: Use external managed MySQL (AWS RDS, Azure Database)
2. **Backend**: Scale backend containers with load balancer
3. **Frontend**: Use CDN for static assets
4. **Sessions**: Use Redis for session storage
5. **Monitoring**: Add Prometheus + Grafana

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Database won't start | Check logs: `docker-compose logs database` |
| Backend can't connect to DB | Wait 30s after first start, check DB health |
| Frontend blank page | Check browser console, verify API_TOKEN |
| API returns 401/403 | Verify token/password in headers |
| Can't access localhost:8080 | Check if port is in use, try different port |
| Changes not appearing | Hard refresh (Ctrl+F5) or clear cache |

---

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)
For API details, see [API.md](API.md)
For full documentation, see [README.md](README.md)
