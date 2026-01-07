# System Architecture Diagram

## High-Level Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         ATTENDANCE TRACKER                          │
│                     Modern RFID Tracking System                     │
└────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Nginx     │────────▶│   Backend   │
│  (Client)   │◀────────│  (Frontend) │◀────────│   (API)     │
└─────────────┘         └─────────────┘         └──────┬──────┘
     │                         │                         │
     │                         │                         │
     │                         │                         ▼
     │                         │                  ┌─────────────┐
     │                         │                  │   MySQL     │
     │                         │                  │  Database   │
     │                         │                  └─────────────┘
     │                         │
     │                         ▼
     │                  Static Files
     │              (HTML, CSS, JS)
     │
     ▼
  LocalStorage
   (Theme, Auth)
```

## Component Details

```
┌──────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  index.html│  │ styles.css │  │   app.js   │                │
│  └────────────┘  └────────────┘  └──────┬─────┘                │
│                                           │                       │
│       ┌───────────────────────────────────┼───────────┐         │
│       │                                   │           │         │
│  ┌────▼────┐  ┌────────────┐  ┌─────────▼──┐  ┌────▼────┐    │
│  │ api.js  │  │ managers.js│  │  users.js  │  │ data.js │    │
│  │(API)    │  │(State Mgmt)│  │(User View) │  │(Data View)│   │
│  └─────────┘  └────────────┘  └────────────┘  └─────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP/JSON
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                           BACKEND                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     server.js                            │   │
│  │            (Express Application)                         │   │
│  └────┬──────────────────────────────────────────────┬─────┘   │
│       │                                               │          │
│  ┌────▼────────┐                               ┌─────▼──────┐  │
│  │ Middleware  │                               │   Routes   │  │
│  ├─────────────┤                               ├────────────┤  │
│  │ - CORS      │                               │ - Auth     │  │
│  │ - Helmet    │                               │ - Users    │  │
│  │ - Auth      │                               │ - Attend   │  │
│  │ - Rate Limit│                               │ - Seasons  │  │
│  └─────────────┘                               │ - Records  │  │
│                                                 └─────┬──────┘  │
│                                                       │          │
│                                                 ┌─────▼──────┐  │
│                                                 │  Database  │  │
│                                                 │   Config   │  │
│                                                 └────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ MySQL Protocol
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                          DATABASE                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────┐     ┌──────────────┐     ┌────────────┐         │
│  │   users   │     │ pastseasons  │     │  records   │         │
│  ├───────────┤     ├──────────────┤     ├────────────┤         │
│  │ userId    │     │ seasonId     │     │ recordId   │         │
│  │ name      │     │ userId       │     │ userId     │         │
│  │ hours     │     │ hours        │     │ startTime  │         │
│  │ rfidKey   │     │ name         │     │ endTime    │         │
│  │ loggedIn  │     │ seasonStart  │     │ notes      │         │
│  │ lastLogin │     └──────────────┘     └────────────┘         │
│  │ lastLogout│                                                   │
│  └───────────┘                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
USER ACTION: Click "Sign In" with RFID

1. Frontend (app.js)
   │
   ├─▶ User clicks button
   │
   └─▶ Call: AttendanceAPI.signIn(rfidKey)
       │
       ▼

2. API Client (api.js)
   │
   ├─▶ Build HTTP request
   │   - Add X-API-Token header
   │   - Set method: POST
   │   - Set body: { rfidKey }
   │
   └─▶ fetch('/api/attendance/sign-in')
       │
       ▼

3. Nginx
   │
   ├─▶ Receive request on port 80
   │
   ├─▶ Check if /api/*
   │
   └─▶ Proxy to backend:3000
       │
       ▼

4. Backend (Express)
   │
   ├─▶ Middleware Chain:
   │   │
   │   ├─▶ CORS
   │   ├─▶ Helmet (security)
   │   ├─▶ Rate Limit check
   │   ├─▶ API Token validation
   │   │
   │   └─▶ Continue if valid
   │
   ├─▶ Route: POST /attendance/sign-in
   │   │
   │   └─▶ Handler in routes/attendance.js
   │
   └─▶ Business Logic:
       │
       ├─▶ Validate rfidKey
       ├─▶ Query database
       │   │
       │   └─▶ SELECT * FROM users WHERE rfidKey = ?
       │
       ├─▶ Check if user exists
       ├─▶ Check if already logged in
       │
       └─▶ If valid:
           │
           └─▶ UPDATE users SET loggedIn = 1, lastLogin = NOW()
               │
               ▼

5. Database (MySQL)
   │
   ├─▶ Execute prepared statement
   ├─▶ Update record
   ├─▶ Return result
   │
   └─▶ Commit transaction
       │
       ▼

6. Backend Response
   │
   └─▶ Send JSON:
       {
         "success": true,
         "message": "User signed in",
         "user": { ... }
       }
       │
       ▼

7. Frontend (api.js)
   │
   ├─▶ Receive response
   ├─▶ Parse JSON
   │
   └─▶ Return to calling code
       │
       ▼

8. View (users.js)
   │
   ├─▶ Update UI
   ├─▶ Add user card to grid
   ├─▶ Start timer
   │
   └─▶ User sees updated interface
```

## Authentication Flow

```
┌──────────────┐
│ User clicks  │
│  "Manage"    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Modal opens  │
│ Password     │
│ input shown  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ User enters      │
│ password         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ POST /auth/login │
│ { password }     │
└──────┬───────────┘
       │
       ▼
┌────────────────────┐
│ Backend validates  │
│ against env var    │
└──────┬─────────────┘
       │
       ├─── Valid ──▶ Return success
       │              │
       │              ▼
       │         ┌─────────────────┐
       │         │ Frontend stores │
       │         │ in LocalStorage │
       │         └────────┬────────┘
       │                  │
       │                  ▼
       │         ┌─────────────────┐
       │         │ Update UI       │
       │         │ Show admin btns │
       │         └─────────────────┘
       │
       └─── Invalid ──▶ Show error
                        Try again
```

## Data Flow: Sign In/Out Cycle

```
SIGN IN:
┌─────────┐      ┌─────────┐      ┌──────────┐
│  RFID   │─────▶│ Backend │─────▶│ Database │
│  Scan   │      │   API   │      │  UPDATE  │
└─────────┘      └─────────┘      └──────────┘
                                        │
                                        │ SET:
                                        │ - loggedIn = 1
                                        │ - lastLogin = NOW()
                                        │
                                        ▼
                                   User Active

WHILE LOGGED IN:
┌─────────┐
│ Frontend│──── Every 1 second ────▶ Update timer display
│  Timer  │                          (current time - lastLogin)
└─────────┘

SIGN OUT:
┌─────────┐      ┌─────────┐      ┌──────────┐
│ Button  │─────▶│ Backend │─────▶│ Database │
│ Click   │      │   API   │      │  UPDATE  │
└─────────┘      └─────────┘      └────┬─────┘
                                        │
                                        │ SET:
                                        │ - loggedIn = 0
                                        │ - lastLogout = NOW()
                                        │ - hours += (logout - login)
                                        │
                                        ├─▶ INSERT INTO records
                                        │   (userId, startTime, endTime)
                                        │
                                        ▼
                                   User Inactive
```

## Docker Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Docker Host Machine                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Docker Network: attendance-network           │ │
│  │                                                            │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │ │
│  │  │   Frontend    │  │    Backend    │  │   Database   │ │ │
│  │  │   (Nginx)     │  │   (Node.js)   │  │   (MySQL)    │ │ │
│  │  │               │  │               │  │              │ │ │
│  │  │ Port: 80      │  │ Port: 3000    │  │ Port: 3306   │ │ │
│  │  │ Volume:       │  │ Volume:       │  │ Volume:      │ │ │
│  │  │ ./frontend    │  │ ./backend     │  │ db_data      │ │ │
│  │  │ (read-only)   │  │ (live mount)  │  │ (persistent) │ │ │
│  │  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘ │ │
│  │          │                   │                  │         │ │
│  │          │                   │                  │         │ │
│  │          │     Depends on ───┤                  │         │ │
│  │          │                   │                  │         │ │
│  │          └──────── Proxies to /api/* ───────────┘         │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Port Mappings:                                                 │
│  Host:8080  ──▶  Frontend:80                                   │
│  Host:3000  ──▶  Backend:3000                                  │
│  Host:3306  ──▶  Database:3306                                 │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

## File System Layout

```
Project Root (attendence/)
│
├─▶ docker-compose.yml ────────┐
│                               │ Defines:
├─▶ .env ──────────────────────┤ - Services
│                               │ - Networks
│                               │ - Volumes
│                               │ - Environment
│                               └─────────────┐
│                                             │
├─▶ backend/ ─────────────────────────────────┼─▶ Node.js Container
│   │                                         │   - npm install
│   ├─▶ package.json ──▶ Dependencies        │   - node server.js
│   ├─▶ server.js ─────▶ Express App         │
│   ├─▶ routes/ ───────▶ API Endpoints       │
│   ├─▶ middleware/ ───▶ Auth, etc.          │
│   └─▶ config/ ───────▶ DB Config           │
│                                             │
├─▶ frontend/ ────────────────────────────────┼─▶ Nginx Container
│   │                                         │   - Serve static
│   ├─▶ index.html ───▶ Main Page            │   - Proxy /api
│   ├─▶ css/ ─────────▶ Styles               │
│   └─▶ js/ ───────────▶ JavaScript          │
│                                             │
├─▶ database/ ────────────────────────────────┼─▶ MySQL Container
│   │                                         │   - init.sql runs
│   └─▶ init.sql ─────▶ Schema               │   - on first start
│                                             │
└─▶ nginx/ ───────────────────────────────────┘
    └─▶ nginx.conf ───▶ Web Server Config
```

## State Management

```
┌────────────────────────────────────────┐
│         Application State               │
├────────────────────────────────────────┤
│                                         │
│  Frontend (In-Memory):                  │
│  ├─▶ activeUsers []                    │
│  ├─▶ currentView (users|data)          │
│  └─▶ hasManagementAccess (bool)        │
│                                         │
│  LocalStorage:                          │
│  ├─▶ managementPassword                │
│  └─▶ theme (light|dark)                │
│                                         │
│  Backend (Database):                    │
│  ├─▶ users                              │
│  ├─▶ pastseasons                        │
│  └─▶ records                            │
│                                         │
└────────────────────────────────────────┘

State Updates:
┌──────────┐
│ UI Event │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Manager      │ (managers.js)
│ Updates      │
└────┬─────────┘
     │
     ├─▶ In-memory state
     ├─▶ LocalStorage (if needed)
     └─▶ API call (if server change)
         │
         ▼
┌──────────────┐
│ Database     │
│ Updated      │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ UI Refreshed │
└──────────────┘
```

## Error Handling Flow

```
Error occurs at any level:

Database Level:
├─▶ MySQL error
└─▶ Caught by backend

Backend Level:
├─▶ Try-catch blocks
├─▶ Log error
└─▶ Send JSON response:
    { success: false, message: "..." }

Frontend Level:
├─▶ API promise rejected
├─▶ Catch in view
├─▶ Display error to user
│   ├─▶ Modal
│   ├─▶ Toast notification
│   └─▶ Inline message
│
└─▶ Log to console

User sees:
└─▶ Friendly error message
```

---

## Legend

```
┌─────┐
│ Box │   Component or Service
└─────┘

  │
  ├─▶    Flow or Connection
  │
  ▼

═══════  Strong Relationship
───────  Weak Relationship
- - - -  Optional/Conditional
```

---

For implementation details, see:
- [STRUCTURE.md](STRUCTURE.md) - Code organization
- [API.md](API.md) - API endpoints
- [README.md](README.md) - Full documentation
