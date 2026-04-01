import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from backend.database import SessionLocal, User
from backend.auth import get_password_hash

def test_signup():
    db = SessionLocal()
    try:
        new_user = User(
            email="test_insertion@example.com",
            full_name="Test Insertion",
            hashed_password=get_password_hash("password123")
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Successfully inserted user: {new_user.id}")
    except ValueError as ve:
        print(f"VAL_ERR: {ve}")
        db.rollback()
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
