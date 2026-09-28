from sqlalchemy import Column, Integer, String, Date, ForeignKey

from app.database import Base


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    start_date = Column(Date, nullable=False)

    end_date = Column(Date, nullable=False)

    reason = Column(
        String(255),
        nullable=False
    )

    status = Column(
        String(20),
        default="pending",
        nullable=False
    )