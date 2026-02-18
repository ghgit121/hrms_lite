# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

![HRMS Lite](https://img.shields.io/badge/HRMS-Lite-4f46e5?style=for-the-badge)

## Live Demo

- **Frontend**: _[Add your Vercel URL here]_
- **Backend API**: _[Add your Railway URL here]_

## Tech Stack

| Layer      | Technology                  |
|------------|----------------------------|
| Frontend   | React 18, Vite, React Router, Axios |
| Backend    | Python 3.11, FastAPI, SQLAlchemy    |
| Database   | PostgreSQL                          |
| Deployment | Vercel (Frontend), Railway (Backend + DB) |

## Features

### Core
- **Employee Management** — Add, view, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present/Absent), view records
- **RESTful API** — Clean API design with proper HTTP status codes

### Bonus
- **Dashboard** — Summary cards showing total employees, present/absent today
- **Attendance Filters** — Filter records by employee ID and date range
- **Present Days Counter** — Total present/absent days per employee
- **Employee Detail View** — Individual attendance history

### UI/UX
- Professional, production-ready interface
- Loading, empty, and error states
- Responsive sidebar navigation
- Modal forms with client-side validation
- Toast notifications for user feedback

## Project Structure

```
HRMS_Lite/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app, CORS, dashboard endpoint
│   │   ├── config.py          # Environment variables
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models.py          # Employee & Attendance ORM models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── employees.py   # Employee CRUD endpoints
│   │       └── attendance.py  # Attendance endpoints
│   ├── requirements.txt
│   ├── Procfile
│   ├── railway.toml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Dashboard, Employees, Attendance pages
│   │   ├── services/api.js    # Axios API client
│   │   ├── App.jsx            # Router setup
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
# Edit .env with your database URL

# Create the database
# psql -U postgres -c "CREATE DATABASE hrms_lite;"

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/dashboard`          | Dashboard summary        |
| GET    | `/api/employees/`         | List all employees       |
| GET    | `/api/employees/{id}`     | Get employee by ID       |
| POST   | `/api/employees/`         | Create new employee      |
| DELETE | `/api/employees/{id}`     | Delete employee          |
| GET    | `/api/attendance/`        | List attendance records  |
| POST   | `/api/attendance/`        | Mark/update attendance   |

### Query Parameters (Attendance)
- `employee_id` — Filter by employee ID
- `date_from` — Filter from date (YYYY-MM-DD)
- `date_to` — Filter to date (YYYY-MM-DD)

