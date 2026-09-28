from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.get(
    "",
    response_model=list[EmployeeResponse]
)
def get_employees(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Employee).order_by(
        Employee.id
    ).all()


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=201
)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Employee).filter(
        Employee.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists"
        )

    employee = Employee(
        **data.model_dump()
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(employee, key, value)

    db.commit()
    db.refresh(employee)

    return employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }