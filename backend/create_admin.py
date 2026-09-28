from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password


db = SessionLocal()

existing = db.query(User).filter(
    User.username == "admin"
).first()

if existing:
    print("Admin already exists.")
else:
    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        role="admin"
    )

    db.add(admin)
    db.commit()

    print("Admin created.")
    print("Username: admin")
    print("Password: admin123")

db.close()