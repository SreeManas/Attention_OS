#!/usr/bin/env python3
"""
Minimal FastAPI backend for AttentionOS.
Serves data from SQLite database via REST API.
"""

import sqlite3
import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Database path configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "attentionos.db")

app = FastAPI(title="AttentionOS API", version="1.0.0")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    """Create and return a database connection."""
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail=f"Database not found at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn


def rows_to_dict(rows) -> List[Dict[str, Any]]:
    """Convert sqlite3.Row objects to dictionaries."""
    return [dict(row) for row in rows]


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/sessions")
async def get_sessions():
    """Get all session summaries."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, start_time, end_time, total_active_seconds, 
                   total_idle_seconds, app_switches, focus_score
            FROM sessions
            ORDER BY start_time DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        return rows_to_dict(rows)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/timeline")
async def get_timeline():
    """Get all activity logs ordered by start time (descending)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, app_name, start_time, end_time, duration_seconds
            FROM activity_logs
            ORDER BY start_time DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        return rows_to_dict(rows)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/app-switches")
async def get_app_switches():
    """Get all app switch events ordered by timestamp (descending)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, from_app, to_app, timestamp
            FROM app_switches
            ORDER BY timestamp DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        return rows_to_dict(rows)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print(f"Database path: {DB_PATH}")
    print("Starting FastAPI server at http://localhost:8000")
    print("API docs available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
