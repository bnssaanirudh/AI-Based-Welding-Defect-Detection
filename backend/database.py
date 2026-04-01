import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(ROOT_DIR, "backend", "history.db")

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to analysis records
    analyses = relationship("AnalysisRecord", back_populates="user")

class AnalysisRecord(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    report_id = Column(String, index=True) # E.g., RPT-2026-001
    audit_type = Column(String, default="User Upload")
    
    # Link to User
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="analyses")

    top_label = Column(String)
    top_confidence = Column(Float)
    severity = Column(String)
    
    # Simple JSON string to store all class metrics
    class_metrics_json = Column(String) 
    
    # Advanced metadata for research/patents
    integrity_score = Column(Float, default=0.0)
    material_type = Column(String, default="Carbon Steel")
    
    # NEW Patent-Grade Columns
    verification_hash = Column(String) # SHA-256 integrity pulse
    dts_data_json = Column(String)     # Digital Twin Synchronizer coordinates
    acoustic_data_json = Column(String) # Fourier acoustic signature data

class FeedbackRecord(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create the tables
Base.metadata.create_all(bind=engine)

# Manual migration for existing database (Adding missing columns if they don't exist)
def run_migrations():
    import sqlite3
    conn = sqlite3.connect(f"{DB_PATH}")
    cursor = conn.cursor()
    
    # 1. Ensure users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("Creating users table manually...")
        Base.metadata.create_all(bind=engine)

    # 2. Add columns if missing
    cursor.execute("PRAGMA table_info(analysis_history);")
    columns = [row[1] for row in cursor.fetchall()]
    
    new_cols = {
        "user_id": "INTEGER",
        "integrity_score": "FLOAT",
        "material_type": "STRING",
        "verification_hash": "STRING",
        "dts_data_json": "STRING",
        "acoustic_data_json": "STRING"
    }
    
    for col, ctype in new_cols.items():
        if col not in columns:
            print(f"Migrating: Adding column {col} to analysis_history")
            cursor.execute(f"ALTER TABLE analysis_history ADD COLUMN {col} {ctype};")
    
    conn.commit()
    conn.close()

run_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
