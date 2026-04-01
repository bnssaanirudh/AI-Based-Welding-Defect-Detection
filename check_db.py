import sqlite3
import os

db_path = os.path.join("backend", "history.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print(f"Tables: {tables}")

# Check columns for users
try:
    cursor.execute("PRAGMA table_info(users);")
    print(f"Users columns: {cursor.fetchall()}")
except Exception as e:
    print(f"Error checking users: {e}")

# Check columns for analysis_records
try:
    cursor.execute("PRAGMA table_info(analysis_records);")
    print(f"Analysis Records columns: {cursor.fetchall()}")
except Exception as e:
    print(f"Error checking analysis_records: {e}")

conn.close()
