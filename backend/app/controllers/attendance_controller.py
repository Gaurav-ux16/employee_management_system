from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.get(
    "",
    response_model=list[AttendanceResponse]
)
def get_attendance(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Attendance).order_by(
        Attendance.date.desc()
    ).all()


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=201
)
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.id == data.employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if data.status not in {
        "present",
        "absent",
        "half_day"
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance status"
        )

    record = Attendance(
        **data.model_dump()
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record