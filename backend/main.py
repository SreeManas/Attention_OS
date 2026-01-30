#!/usr/bin/env python3
"""
Minimal FastAPI backend for AttentionOS.
Serves data from SQLite database via REST API.
"""

import sqlite3
import os
import random
from datetime import datetime, timedelta
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

# App categories for demo data
PRODUCTIVE_APPS = ["VSCode", "Terminal", "Xcode", "PyCharm", "Figma", "Notion", "Chrome - Docs", "Chrome - GitHub"]
NEUTRAL_APPS = ["Chrome", "Safari", "Finder", "Notes", "Preview", "Spotify"]
DISTRACTING_APPS = ["WhatsApp", "Slack", "Discord", "Twitter", "YouTube", "Reddit", "Instagram", "TikTok"]
ALL_APPS = PRODUCTIVE_APPS + NEUTRAL_APPS + DISTRACTING_APPS


def get_db_connection():
    """Create and return a database connection."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT,
            end_time TEXT,
            total_active_seconds INTEGER,
            total_idle_seconds INTEGER,
            app_switches INTEGER,
            focus_score REAL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            duration_seconds INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_switches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_app TEXT,
            to_app TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()


def generate_demo_data():
    """Generate 20-50 fake focus sessions over the last 7 days."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Wipe existing data
    cursor.execute("DELETE FROM sessions")
    cursor.execute("DELETE FROM activity_logs")
    cursor.execute("DELETE FROM app_switches")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('sessions', 'activity_logs', 'app_switches')")
    
    now = datetime.now()
    num_sessions = random.randint(25, 45)
    
    # Distribute sessions across 7 days (more on some days)
    sessions_per_day = {}
    for day_offset in range(7):
        day = (now - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        # 0-4 sessions per day, weighted toward 1-2
        sessions_per_day[day] = random.choices([0, 1, 2, 3, 4], weights=[5, 30, 40, 20, 5])[0]
    
    # Adjust to hit target count
    total = sum(sessions_per_day.values())
    if total < num_sessions:
        for _ in range(num_sessions - total):
            day = random.choice(list(sessions_per_day.keys()))
            sessions_per_day[day] += 1
    
    session_id = 0
    
    for day_str, count in sessions_per_day.items():
        if count == 0:
            continue
            
        # Generate session start times for this day (spread out between 8am-10pm)
        day_base = datetime.strptime(day_str, "%Y-%m-%d")
        start_hours = sorted(random.sample(range(8, 22), min(count, 14)))
        
        for i, start_hour in enumerate(start_hours[:count]):
            session_id += 1
            
            # Determine session quality (good/average/bad)
            quality = random.choices(["good", "average", "bad"], weights=[40, 40, 20])[0]
            
            if quality == "good":
                focus_score = random.uniform(80, 95)
                duration_mins = random.randint(45, 120)
                idle_ratio = random.uniform(0.05, 0.15)
                switch_frequency = random.uniform(0.3, 0.8)  # switches per minute
            elif quality == "average":
                focus_score = random.uniform(60, 79)
                duration_mins = random.randint(30, 90)
                idle_ratio = random.uniform(0.15, 0.30)
                switch_frequency = random.uniform(0.8, 1.5)
            else:  # bad
                focus_score = random.uniform(40, 59)
                duration_mins = random.randint(15, 60)
                idle_ratio = random.uniform(0.30, 0.50)
                switch_frequency = random.uniform(1.5, 3.0)
            
            # Session times
            start_time = day_base.replace(hour=start_hour, minute=random.randint(0, 59))
            end_time = start_time + timedelta(minutes=duration_mins)
            
            total_seconds = duration_mins * 60
            idle_seconds = int(total_seconds * idle_ratio)
            active_seconds = total_seconds - idle_seconds
            app_switches = int(duration_mins * switch_frequency)
            
            # Insert session
            cursor.execute('''
                INSERT INTO sessions (start_time, end_time, total_active_seconds, 
                                      total_idle_seconds, app_switches, focus_score)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                start_time.isoformat(),
                end_time.isoformat(),
                active_seconds,
                idle_seconds,
                app_switches,
                round(focus_score, 2)
            ))
            
            # Generate timeline events for this session
            current_time = start_time
            prev_app = None
            
            while current_time < end_time:
                # Pick app based on quality
                if quality == "good":
                    app_pool = PRODUCTIVE_APPS * 4 + NEUTRAL_APPS * 2 + DISTRACTING_APPS + ["Idle"]
                elif quality == "average":
                    app_pool = PRODUCTIVE_APPS * 2 + NEUTRAL_APPS * 3 + DISTRACTING_APPS * 2 + ["Idle"] * 2
                else:
                    app_pool = PRODUCTIVE_APPS + NEUTRAL_APPS * 2 + DISTRACTING_APPS * 4 + ["Idle"] * 3
                
                app_name = random.choice(app_pool)
                
                # Duration based on app type
                if app_name == "Idle":
                    duration = random.randint(30, 180)
                elif app_name in PRODUCTIVE_APPS:
                    duration = random.randint(120, 600)
                elif app_name in DISTRACTING_APPS:
                    duration = random.randint(30, 300)
                else:
                    duration = random.randint(60, 300)
                
                event_end = min(current_time + timedelta(seconds=duration), end_time)
                actual_duration = int((event_end - current_time).total_seconds())
                
                if actual_duration > 0:
                    cursor.execute('''
                        INSERT INTO activity_logs (app_name, start_time, end_time, duration_seconds)
                        VALUES (?, ?, ?, ?)
                    ''', (app_name, current_time.isoformat(), event_end.isoformat(), actual_duration))
                    
                    # Record app switch
                    if prev_app and prev_app != app_name:
                        cursor.execute('''
                            INSERT INTO app_switches (from_app, to_app, timestamp)
                            VALUES (?, ?, ?)
                        ''', (prev_app, app_name, current_time.isoformat()))
                    
                    prev_app = app_name
                
                current_time = event_end
    
    conn.commit()
    
    # Get counts for response
    cursor.execute("SELECT COUNT(*) FROM sessions")
    session_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM activity_logs")
    activity_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM app_switches")
    switch_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "sessions": session_count,
        "activity_logs": activity_count,
        "app_switches": switch_count
    }


def rows_to_dict(rows) -> List[Dict[str, Any]]:
    """Convert sqlite3.Row objects to dictionaries."""
    return [dict(row) for row in rows]


@app.on_event("startup")
async def startup_event():
    """Initialize database and generate demo data if empty."""
    init_database()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM sessions")
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("📊 No sessions found. Generating demo data...")
        result = generate_demo_data()
        print(f"✅ Generated {result['sessions']} sessions, {result['activity_logs']} activity logs, {result['app_switches']} app switches")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/dev/generate-demo-data")
async def regenerate_demo_data():
    """Wipe existing data and regenerate fresh demo data."""
    try:
        result = generate_demo_data()
        return {
            "status": "success",
            "message": f"Generated {result['sessions']} sessions with {result['activity_logs']} activity logs",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
