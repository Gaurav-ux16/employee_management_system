from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    designation: str
    department_id: int
    phone: Optional[str] = None
    status: str = "active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    designation: Optional[str] = None
    department_id: Optional[int] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)