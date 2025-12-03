import sqlite3
import datetime
from contextlib import contextmanager

DB_NAME = "cctv_analytics.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP,
            gender TEXT,
            age TEXT
        )
    ''')
    conn.commit()
    conn.close()

@contextmanager
def get_db_conn():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Helper to simulate Pydantic model/SQLAlchemy object
class Detection:
    def __init__(self, id, timestamp, gender, age):
        self.id = id
        self.timestamp = timestamp
        self.gender = gender
        self.age = age
