from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LeaveBase(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str
    status: str = "pending"


class LeaveCreate(LeaveBase):
    pass


class LeaveUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    status: Optional[str] = None


class LeaveResponse(LeaveBase):
    id: int

    model_config = ConfigDict(from_attributes=True)