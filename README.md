# CV Management System (Full-Stack)

A full-stack CV management system where users can register, login, and manage one or more CVs with detailed sections:
Education, Experience, Projects, and Skills — with PDF export and Swagger API documentation.

---

## Features

- User authentication (login/register)
- Create, update, delete CV
- Role-based access control (RBAC)
  - User: manage own CVs
  - Admin: view all CVs
- Export CV to PDF

## Roles

### User

- Can manage only their own CVs

## Make a user Admin

You can update a user role using Prisma Studio:

1. Run:
   npx prisma studio

2. Open the User table

3. Change role to:
   admin

## Admin Capabilities

- View all users' CVs
- Access any CV details
- Export any CV as PDF

## API Behavior

- GET /api/cv
  - User: returns own CVs
  - Admin: returns all CVs

- GET /api/cv/:id
  - User: only own CV
  - Admin: any CV

### Admin

- Can view all CVs
- Can access any CV (including PDF export)

### Authentication

- Register / Login
- JWT authentication
- Protected routes (backend + frontend)

### CV Management

- Create / Update / Delete CV
- Full CV view (CV + all sections)
- Manage sections:
  - Education
  - Experience
  - Projects
  - Skills

### Dashboard

- User dashboard summary (e.g., total CVs, last updated CV)

### API Documentation

- OpenAPI (Swagger UI)

### PDF Export

- Export CV as PDF (print-friendly layout)

---

## Tech Stack

### Backend

- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT (Json Web Tokens)
- Swagger (OpenAPI)
- Validation middleware

### Frontend

- React (Vite)
- Axios
- Auth Context (token + user)
- Protected routing

---

## Project Structure

cv-management/ ├── backend/ │ ├── prisma/ │ └── src/ │ ├── controllers/ │ ├── routes/ │ ├── middlewares/
│ └── utils/ └── frontend/ └── src/ ├── api/ ├── auth/ ├── components/ └── pages/

---

## Requirements

- Node.js (LTS recommended)
- PostgreSQL (v13+ works)
- npm

---

## Setup & Run (Local)

### 1. Backend Setup

cd backend
npm install
Create .env inside backend/:

### .Env

PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cv_management?schema=public"
JWT_SECRET="your_super_secret_key"
NODE_ENV=development
Run Prisma migrations:
npx prisma migrate dev
Start the backend:
npm run dev
Backend runs on:
http://localhost:5000�
Health check:
http://localhost:5000/api/health�
Swagger:
http://localhost:5000/api-docs�

2. Frontend Setup
   cd ../frontend
   npm install
   npm run dev
   Frontend runs on:
   http://localhost:5173�
   Note: Vite dev server typically runs on port 5173, while the API runs on port 5000.
   API Endpoints (Overview)
   Auth
   POST /api/auth/register
   POST /api/auth/login
   GET /api/auth/me (requires token)
   CV
   POST /api/cv (requires token)
   GET /api/cv (requires token)
   - User: list own CVs

- Admin: list all CVs
  GET /api/cv/:id/full (requires token) → full CV (with sections)
  PUT /api/cv/:id (requires token)
  - User: only own CV

- Admin: any CV
  DELETE /api/cv/:id (requires token)
  - User: only own CV
- Admin: any CV
  Sections (Examples)
  POST /api/education/cv/:cvId
  GET /api/education/cv/:cvId
  PUT /api/education/:id
  DELETE /api/education/:id
  Same pattern for:
  Experience
  Project
  Skill
  Dashboard
  GET /api/dashboard/summary (requires token)
  Full details available in Swagger UI.
  Authentication (JWT)
  Protected endpoints require:

Authorization: Bearer <token>
The token is returned from:
POST /api/auth/login
Frontend stores token in localStorage under key:
token
Axios interceptor automatically attaches the header.
Testing
If tests exist in backend:
cd backend
npm test
Common Troubleshooting
401 Unauthorized / Invalid token format
Ensure the request header is: Authorization: Bearer <token>
Make sure localStorage.token is set after login.
Re-login to generate a fresh token.
404 Route not found
Ensure the route is mounted correctly in app.js (e.g. app.use("/api/dashboard", dashboardRoutes)).
Prisma errors (user relation)
CV creation must include userId from decoded JWT: userId: req.user.userId
Notes / Future Improvements (Optional)
Role-based access control (ADMIN/USER)
Toast notifications instead of alerts
Unified error handling format
Deployment (Render/Railway/Vercel)
Author
Developed by:mohammed_shikh_aljabal
