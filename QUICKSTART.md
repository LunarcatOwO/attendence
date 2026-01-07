# Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Text editor (VS Code, Notepad++, etc.)

## Setup Steps

### 1. Configure Environment
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env with your passwords
notepad .env
```

**Required changes in .env:**
- `DB_ROOT_PASSWORD`: Set a strong MySQL root password
- `DB_PASSWORD`: Set a strong database user password
- `MANAGEMENT_PASSWORD`: Set your admin password for the web interface
- `API_TOKEN`: Set a random string for API security
- `JWT_SECRET`: Set a random string for JWT tokens

### 2. Update Frontend API Token
Open `frontend/js/api.js` in a text editor and update line 2:
```javascript
const API_TOKEN = 'your_api_token_change_me'; // Must match .env
```
Change this to match the `API_TOKEN` you set in `.env`

### 3. Start the Application
```bash
# Start all services
docker-compose up -d

# Check if everything is running
docker-compose ps
```

### 4. Access the Application
- Open your browser to: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

### 5. First Time Login
1. Click the "Manage" button
2. Enter the password you set as `MANAGEMENT_PASSWORD` in `.env`
3. You can now add users and manage attendance

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart a service
docker-compose restart backend

# Rebuild after changes
docker-compose up --build -d

# Complete reset (deletes all data!)
docker-compose down -v
```

## Adding Your First User

1. Log in to management (see step 5 above)
2. Click the "+" button in the bottom right
3. Enter user name and RFID key
4. Click "Add User"

## Troubleshooting

### "Connection refused" or "Cannot connect"
- Make sure Docker Desktop is running
- Check if containers are running: `docker-compose ps`
- View logs: `docker-compose logs backend`

### "Database connection failed"
- Wait 30 seconds after first start (MySQL takes time to initialize)
- Check MySQL logs: `docker-compose logs database`
- Verify your `.env` passwords are correct

### Frontend shows blank page
- Clear browser cache
- Check browser console (F12) for errors
- Verify `API_TOKEN` matches in both `.env` and `frontend/js/api.js`

### Can't log in to management
- Verify `MANAGEMENT_PASSWORD` in `.env`
- Check browser console (F12) for errors
- Ensure backend is running: http://localhost:3000/health

## Next Steps

- Read the full README.md for advanced configuration
- Set up HTTPS for production use
- Configure backups for your database
- Customize the theme and branding

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all passwords in `.env` are set
3. Ensure ports 3000 and 8080 are not in use by other applications
4. Try a complete restart: `docker-compose down && docker-compose up -d`
