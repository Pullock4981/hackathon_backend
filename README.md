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

## Phase 2: Project & Student Management (Completed)
In this phase, we implemented the core entities: Projects and Students. Mentors can create projects and manage the students inside them.

### Features:
- Project Model & APIs (Create, List, Details)
- Student Model & APIs (Single add, Bulk add via array)
- Nested routing (`/api/v1/projects/:projectId/students`)

### API Endpoints

#### 1. Create Project
- **Route:** `POST /api/v1/projects`
- **Access:** Private
- **Headers:** `Authorization: Bearer <token>`
- **Request Body Example:**
  ```json
  {
    "name": "Albatross Boot-camp",
    "batch": "Batch 4",
    "description": "Full stack web development"
  }
  ```

#### 2. Get All Projects
- **Route:** `GET /api/v1/projects`
- **Access:** Private

#### 3. Add Single Student
- **Route:** `POST /api/v1/projects/:projectId/students`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phoneNumber": "01700000000"
  }
  ```

#### 4. Bulk Add Students (Import)
- **Route:** `POST /api/v1/projects/:projectId/students/bulk`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "students": [
      { "name": "User 1", "email": "user1@example.com" },
      { "name": "User 2", "email": "user2@example.com" }
    ]
  }
  ```

#### 5. Update Student Profile
- **Route:** `PUT /api/v1/students/:id`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "profiles": {
      "github": "https://github.com/janedoe",
      "githubReady": true
    }
  }
  ```

## Phase 3: Daily Operations (Completed)
This phase tracks daily attendance and tasks for the students. The submission updates the student's dynamic marks and streaks.

### Features:
- Attendance submission (Present, Absent, Leave) with dynamic global points.
- Task submission (Complete, Incomplete) with dynamic global points.
- Auto-updating student's total attendance, marks, and streaks on submission.

### API Endpoints

#### 1. Submit Attendance
- **Route:** `POST /api/v1/projects/:projectId/attendance`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "studentId": "60b9b...",
    "date": "2023-01-01",
    "status": "Present"
  }
  ```

#### 2. Get Project Attendance
- **Route:** `GET /api/v1/projects/:projectId/attendance?date=2023-01-01`
- **Access:** Private

#### 3. Submit Task
- **Route:** `POST /api/v1/projects/:projectId/tasks`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "studentId": "60b9b...",
    "date": "2023-01-01",
    "title": "React Component Design",
    "status": "Complete"
  }
  ```

#### 4. Get Project Tasks
- **Route:** `GET /api/v1/projects/:projectId/tasks?date=2023-01-01`
- **Access:** Private

---
*Note: This README will be updated as new phases are completed.*
