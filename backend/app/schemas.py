from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional, List


# ── Employee Schemas ──

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v, info):
        if not v or not v.strip():
            raise ValueError(f"{info.field_name} cannot be empty")
        return v.strip()


class EmployeeOut(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str

    class Config:
        from_attributes = True


class EmployeeWithAttendance(EmployeeOut):
    total_present: int = 0
    total_absent: int = 0


# ── Attendance Schemas ──

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in ("Present", "Absent"):
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v

    @field_validator("employee_id")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("employee_id cannot be empty")
        return v.strip()


class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    date: date
    status: str

    class Config:
        from_attributes = True


class AttendanceWithEmployee(AttendanceOut):
    employee_name: Optional[str] = None


# ── Dashboard Schema ──

class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_today: int
