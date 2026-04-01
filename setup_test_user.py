import os
from backend.database import SessionLocal, User
from backend.auth import get_password_hash

def setup_user():
    db = SessionLocal()
    email = "test@example.com"
    password = "password123"
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.hashed_password = get_password_hash(password)
        print(f"Updated password for {email}")
    else:
        user = User(
            email=email,
            full_name="Test User",
            hashed_password=get_password_hash(password)
        )
        db.add(user)
        print(f"Created user {email}")
    
    db.commit()
    db.close()

if __name__ == "__main__":
    setup_user()
