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

## Phase 4: Assessment (Quiz Engine) (Completed)
This phase includes creating quizzes and an auto-marking exam engine.

### Features:
- Create Quiz with questions, options, and marks.
- Submit Quiz for auto-grading.
- Auto-calculate score based on correct answers.

### API Endpoints

#### 1. Create Quiz
- **Route:** `POST /api/v1/projects/:projectId/quizzes`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "title": "React Basics",
    "status": "Live",
    "durationMinutes": 15,
    "questions": [
      {
        "questionText": "What is React?",
        "options": ["Library", "Framework", "Language"],
        "correctAnswer": "Library",
        "marks": 5
      }
    ]
  }
  ```

#### 2. Get All Quizzes
- **Route:** `GET /api/v1/projects/:projectId/quizzes`
- **Access:** Private

#### 3. Submit Quiz (Auto-Marking)
- **Route:** `POST /api/v1/projects/:projectId/quizzes/:id/submit`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "studentId": "60b9b...",
    "answers": [
      {
        "questionId": "60b9b...",
        "providedAnswer": "Library"
      }
    ]
  }
  ```

## Phase 5: Aggregation, Tiers & Leaderboards (Completed)
This phase implements the core calculation logic for student tiers (A, B, C), generates project leaderboards, and provides dashboard statistics.

### Features:
- Auto-calculate student tiers based on attendance, mock score, and profile readiness.
- Project Leaderboard sorted by total marks.
- Global dashboard statistics (total students, active, hired, placement rate) for mentors.

### API Endpoints

#### 1. Calculate Tiers
- **Route:** `POST /api/v1/projects/:projectId/calculate-tiers`
- **Access:** Private
- **Description:** Scans all students in a project and updates their tier.

#### 2. Get Leaderboard
- **Route:** `GET /api/v1/projects/:projectId/leaderboard`
- **Access:** Private
- **Response Example:**
  ```json
  {
    "success": true,
    "count": 10,
    "data": [
      {
        "_id": "60b9b...",
        "name": "Jane Doe",
        "tier": "Tier A",
        "totalMark": 150
      }
    ]
  }
  ```

#### 3. Dashboard Statistics
- **Route:** `GET /api/v1/dashboard`
- **Access:** Private
- **Response Example:**
  ```json
  {
    "success": true,
    "data": {
      "totalProjects": 2,
      "totalStudents": 50,
      "totalHired": 5,
      "totalActive": 40,
      "placementRate": "10.00%"
    }
  }
  ```

## Phase 6: Automation & Advanced Features (Completed)
This phase introduces automated CRON jobs and AI integrations (Resume Scorer & Risk Predictor).

### Features:
- **CRON Job:** Runs daily at midnight to update attendance streaks and check missing submissions.
- **AI Integration:** Mock APIs representing external AI connections for resume evaluation and risk prediction.

### API Endpoints

#### 1. AI Resume Scorer (Mock)
- **Route:** `POST /api/v1/ai/resume-score`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "resumeUrl": "https://example.com/resume.pdf"
  }
  ```
- **Response Example:**
  ```json
  {
    "success": true,
    "data": {
      "score": 85,
      "feedback": "The resume looks good but could use more details on recent projects.",
      "improvements": [
        "Add quantitative metrics",
        "Highlight leadership roles"
      ]
    }
  }
  ```

#### 2. AI Risk Predictor (Mock)
- **Route:** `POST /api/v1/ai/predict-risk`
- **Access:** Private
- **Request Body Example:**
  ```json
  {
    "studentStats": {
      "attendancePercentage": 45,
      "totalMark": 30
    }
  }
  ```
- **Response Example:**
  ```json
  {
    "success": true,
    "data": {
      "riskLevel": "High",
      "reason": "Low attendance trend detected."
    }
  }
  ```

## Phase 7: AI Email Automation (Completed)
This phase introduces an automated notification system that sends personalized AI-generated emails to students in the "Red Zone" (High Risk) and their mentors.

### Features:
- **Nodemailer Setup:** Integration for sending emails via SMTP (e.g., Gmail App Password).
- **OpenAI Integration:** Dynamically generates professional, motivational warning emails for students.
- **Automated Workflow:** The CRON job (which runs daily) automatically finds High Risk students and triggers this email.

---
## Environment Variables Setup
To run this project locally, you need to create a `.env` file in the root directory and copy the contents from `.env.example`.

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your actual credentials:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `SMTP_USER` & `SMTP_PASS`: Your Gmail address and 16-digit App Password.
   - `OPENAI_API_KEY`: Your OpenAI API Key for dynamic email generation.

---
*This concludes all planned phases for the Hackathon Backend!*
