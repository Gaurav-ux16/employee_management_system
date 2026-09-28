from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse
)


router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


@router.get(
    "",
    response_model=list[DepartmentResponse]
)
def get_departments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Department).order_by(
        Department.name
    ).all()


@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=201
)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Department).filter(
        Department.name == data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Department already exists"
        )

    department = Department(
        **data.model_dump()
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department