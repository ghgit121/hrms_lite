import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app.models import Employee, Attendance
from app.schemas import EmployeeCreate, EmployeeOut, EmployeeWithAttendance

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.get("/", response_model=List[EmployeeWithAttendance])
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.full_name).all()
    result = []
    for emp in employees:
        present = sum(1 for a in emp.attendances if a.status == "Present")
        absent = sum(1 for a in emp.attendances if a.status == "Absent")
        result.append(
            EmployeeWithAttendance(
                employee_id=emp.employee_id,
                full_name=emp.full_name,
                email=emp.email,
                department=emp.department,
                total_present=present,
                total_absent=absent,
            )
        )
    return result


@router.get("/{employee_id}", response_model=EmployeeWithAttendance)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found",
        )
    present = sum(1 for a in emp.attendances if a.status == "Present")
    absent = sum(1 for a in emp.attendances if a.status == "Absent")
    return EmployeeWithAttendance(
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        email=emp.email,
        department=emp.department,
        total_present=present,
        total_absent=absent,
    )


@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    # Check for duplicate employee_id
    existing = (
        db.query(Employee)
        .filter(Employee.employee_id == payload.employee_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{payload.employee_id}' already exists",
        )
    # Check for duplicate email
    existing_email = (
        db.query(Employee).filter(Employee.email == payload.email).first()
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{payload.email}' is already in use",
        )
    employee = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate employee ID or email",
        )
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found",
        )
    db.delete(emp)
    db.commit()
    return None
