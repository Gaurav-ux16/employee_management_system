from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.leave import Leave
from app.schemas.leave import (
    LeaveCreate,
    LeaveUpdate,
    LeaveResponse
)


router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"]
)


@router.get(
    "",
    response_model=list[LeaveResponse]
)
def get_leaves(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Leave).order_by(
        Leave.start_date.desc()
    ).all()


@router.post(
    "",
    response_model=LeaveResponse,
    status_code=201
)
def create_leave(
    data: LeaveCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    leave = Leave(
        **data.model_dump()
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.patch(
    "/{leave_id}",
    response_model=LeaveResponse
)
def update_leave(
    leave_id: int,
    data: LeaveUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    leave = db.query(Leave).filter(
        Leave.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if data.status not in {
        "pending",
        "approved",
        "rejected"
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid leave status"
        )

    leave.status = data.status

    db.commit()
    db.refresh(leave)

    return leave