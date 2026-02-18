import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import date
from typing import List, Optional

from app.database import get_db
from app.models import Employee, Attendance
from app.schemas import AttendanceCreate, AttendanceOut, AttendanceWithEmployee

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.get("/", response_model=List[AttendanceWithEmployee])
def list_attendance(
    employee_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    records = query.order_by(Attendance.date.desc()).all()
    result = []
    for r in records:
        emp = db.query(Employee).filter(Employee.employee_id == r.employee_id).first()
        result.append(
            AttendanceWithEmployee(
                id=r.id,
                employee_id=r.employee_id,
                date=r.date,
                status=r.status,
                employee_name=emp.full_name if emp else None,
            )
        )
    return result


@router.post("/", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    emp = (
        db.query(Employee)
        .filter(Employee.employee_id == payload.employee_id)
        .first()
    )
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{payload.employee_id}' not found",
        )
    # Check for duplicate attendance on the same date
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date,
        )
        .first()
    )
    if existing:
        # Update the existing record instead
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        return existing

    attendance = Attendance(
        id=str(uuid.uuid4()),
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    try:
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already marked for this date",
        )
    return attendance
