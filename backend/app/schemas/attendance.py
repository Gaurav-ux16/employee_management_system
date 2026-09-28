from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)