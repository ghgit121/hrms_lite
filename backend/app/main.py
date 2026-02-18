import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
import time

from app.database import engine, Base, get_db
from app.models import Employee, Attendance
from app.schemas import DashboardSummary
from app.routers import employees, attendance
from app.config import FRONTEND_URL, DATABASE_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (non-blocking)
    try:
        logger.info("🔗 Connecting to database...")
        logger.info(f"   DATABASE_URL set: {bool(os.getenv('DATABASE_URL'))}")
        logger.info(f"   PORT: {os.getenv('PORT', 'not set')}")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"⚠️ Database table creation failed: {e}")
    
    logger.info("=" * 60)
    logger.info("🚀 HRMS Lite API is READY and listening for requests")
    logger.info(f"   Port: {os.getenv('PORT', 'not set')}")
    logger.info("=" * 60)
    
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for deployment flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(employees.router)
app.include_router(attendance.router)


@app.get("/")
def root():
    logger.info("🎯 Root endpoint called!")
    return {"message": "HRMS Lite API is running", "version": "1.0.0"}


@app.get("/api/health")
def health():
    logger.info("🏥 Health check called!")
    db_ok = False
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    return {
        "status": "healthy",
        "database": "connected" if db_ok else "disconnected",
        "database_url_set": bool(os.getenv("DATABASE_URL")),
        "port": os.getenv("PORT", "not set"),
    }


@app.get("/api/dashboard", response_model=DashboardSummary)
def dashboard(db: Session = Depends(get_db)):
    total_employees = db.query(Employee).count()
    today = date.today()
    present_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Present")
        .count()
    )
    absent_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .count()
    )
    not_marked_today = total_employees - present_today - absent_today
    return DashboardSummary(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        not_marked_today=not_marked_today,
    )
