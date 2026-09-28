from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.employee import Employee
from app.models.department import Department
from app.models.attendance import Attendance
from app.models.leave import Leave


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total_employees = db.query(
        func.count(Employee.id)
    ).scalar()

    total_departments = db.query(
        func.count(Department.id)
    ).scalar()

    present = db.query(
        func.count(Attendance.id)
    ).filter(
        Attendance.status == "present"
    ).scalar()

    absent = db.query(
        func.count(Attendance.id)
    ).filter(
        Attendance.status == "absent"
    ).scalar()

    half_day = db.query(
        func.count(Attendance.id)
    ).filter(
        Attendance.status == "half_day"
    ).scalar()

    pending_leaves = db.query(
        func.count(Leave.id)
    ).filter(
        Leave.status == "pending"
    ).scalar()

    return {
        "totalEmployees": total_employees,
        "totalDepartments": total_departments,
        "present": present,
        "absent": absent,
        "halfDay": half_day,
        "pendingLeaves": pending_leaves
    }