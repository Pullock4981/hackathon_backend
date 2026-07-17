# Student Management & Performance Tracking System - Backend

This is the backend for the Student Management & Performance Tracking System. The project is divided into multiple phases.

## Phase 1: Foundation & Authentication (Completed)
In this phase, we have set up the basic structure, database models, and authentication system using JWT.

### Features:
- User Model (`admin` and `mentor` roles)
- Global Settings Model (to manage points for tasks and attendance globally)
- Role-based access control middleware (`protect` and `authorize`)

### API Endpoints

#### 1. Register User
- **Route:** `POST /api/v1/auth/register`
- **Access:** Public
- **Request Body Example:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "mentor"
  }
  ```
- **Response Example:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60b9b...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "mentor"
    }
  }
  ```

#### 2. Login User
- **Route:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body Example:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response Example:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60b9b...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "mentor"
    }
  }
  ```

#### 3. Get Current User
- **Route:** `GET /api/v1/auth/me`
- **Access:** Private (Requires Bearer token or cookie)
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60b9b...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "mentor",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### 4. Logout User
- **Route:** `GET /api/v1/auth/logout`
- **Access:** Private
- **Response Example:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

---
*Note: This README will be updated as new phases are completed.*
