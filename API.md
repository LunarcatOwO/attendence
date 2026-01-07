# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints require an API token:
```
X-API-Token: your_api_token
```

Management endpoints also require:
```
X-Management-Password: your_admin_password
```

---

## Authentication Endpoints

### Login
**POST** `/auth/login`

Authenticate for management access.

**Request Body:**
```json
{
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "hasManagementAccess": true
}
```

---

## User Endpoints

### Get All Users
**GET** `/users`

Returns all users in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "name": "John Doe",
      "hours": 45.50,
      "rfidKey": "1234567890",
      "loggedIn": 0,
      "lastLogin": "2024-01-15 10:30:00",
      "lastLogout": "2024-01-15 18:45:00"
    }
  ],
  "count": 1
}
```

### Get User by ID
**GET** `/users?userId=1`

Returns a specific user.

### Get User by RFID
**GET** `/users?rfidKey=1234567890`

Returns a user by RFID key.

### Get Logged-In Users
**GET** `/users/logged-in`

Returns all currently logged-in users.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "name": "John Doe",
      "hours": 45.50,
      "rfidKey": "1234567890",
      "loggedIn": 1,
      "lastLogin": "2024-01-15 14:30:00"
    }
  ],
  "count": 1
}
```

### Create User
**POST** `/users`

Create a new user (requires management auth).

**Headers:**
```
X-API-Token: your_api_token
X-Management-Password: your_admin_password
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "rfidKey": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "userId": 2
}
```

### Update User
**PUT** `/users/:id`

Update user information (requires management auth).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "hours": 50.00
}
```

### Delete User
**DELETE** `/users/:id`

Delete a user (requires management auth).

---

## Attendance Endpoints

### Sign In
**POST** `/attendance/sign-in`

Sign in a user via RFID.

**Request Body:**
```json
{
  "rfidKey": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User signed in successfully",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "loggedIn": true
  }
}
```

### Sign Out
**POST** `/attendance/sign-out`

Sign out a user (requires management auth).

**Headers:**
```
X-Management-Password: your_admin_password
```

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User signed out successfully",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "loggedIn": false
  }
}
```

### Sign Out All Users
**POST** `/attendance/sign-out-all`

Sign out all logged-in users (requires management auth).

**Response:**
```json
{
  "success": true,
  "message": "All users signed out successfully",
  "count": 3
}
```

---

## Season Endpoints

### Get All Seasons
**GET** `/seasons`

Returns all season start dates.

**Response:**
```json
{
  "success": true,
  "data": ["2024-01-01", "2023-01-01"],
  "count": 2
}
```

### Get Season Data
**GET** `/seasons/:date`

Get all users' data for a specific season.

**Example:** `/seasons/2024-01-01`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "seasonId": 1,
      "userId": 1,
      "name": "John Doe",
      "hours": 120.50,
      "seasonStartDate": "2024-01-01"
    }
  ],
  "count": 1
}
```

### Create New Season
**POST** `/seasons`

Archive current season and start new one (requires management auth).

**Request Body:**
```json
{
  "seasonStartDate": "2025-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New season created successfully",
  "seasonStartDate": "2025-01-01"
}
```

---

## Record Endpoints

### Get Records
**GET** `/records`

Get attendance records (requires management auth).

**Query Parameters:**
- `userId` - Filter by user ID
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)
- `limit` - Limit results (default: 100)

**Example:** `/records?userId=1&limit=50`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "recordId": 1,
      "userId": 1,
      "startTime": "2024-01-15 09:00:00",
      "endTime": "2024-01-15 17:00:00",
      "notes": null
    }
  ],
  "count": 1
}
```

### Get Record by ID
**GET** `/records/:id`

Get a specific record (requires management auth).

### Update Record
**PUT** `/records/:id`

Update a record (requires management auth).

**Request Body:**
```json
{
  "startTime": "2024-01-15 09:00:00",
  "endTime": "2024-01-15 17:30:00",
  "notes": "Corrected end time"
}
```

### Delete Record
**DELETE** `/records/:id`

Delete a record (requires management auth).

---

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing token/password)
- `403` - Forbidden (invalid token/password)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints

---

## Examples

### Using cURL

**Get all users:**
```bash
curl -H "X-API-Token: your_api_token" \
  http://localhost:3000/api/users
```

**Sign in a user:**
```bash
curl -X POST \
  -H "X-API-Token: your_api_token" \
  -H "Content-Type: application/json" \
  -d '{"rfidKey":"1234567890"}' \
  http://localhost:3000/api/attendance/sign-in
```

**Create a user:**
```bash
curl -X POST \
  -H "X-API-Token: your_api_token" \
  -H "X-Management-Password: your_admin_password" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","rfidKey":"1234567890"}' \
  http://localhost:3000/api/users
```

### Using JavaScript

```javascript
const API_TOKEN = 'your_api_token';
const BASE_URL = 'http://localhost:3000/api';

async function getUsers() {
  const response = await fetch(`${BASE_URL}/users`, {
    headers: {
      'X-API-Token': API_TOKEN
    }
  });
  
  const data = await response.json();
  return data;
}

async function signInUser(rfidKey) {
  const response = await fetch(`${BASE_URL}/attendance/sign-in`, {
    method: 'POST',
    headers: {
      'X-API-Token': API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rfidKey })
  });
  
  return await response.json();
}
```
