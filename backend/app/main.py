from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.auth_controller import router as auth_router
from app.controllers.employee_controller import router as employee_router
from app.controllers.department_controller import router as department_router
from app.controllers.attendance_controller import router as attendance_router
from app.controllers.leave_controller import router as leave_router
from app.controllers.dashboard_controller import router as dashboard_router


app = FastAPI(
    title="Employee Management System API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "Employee Management System API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(department_router)
app.include_router(attendance_router)
app.include_router(leave_router)
app.include_router(dashboard_router)