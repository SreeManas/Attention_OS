#!/usr/bin/env python3
"""
PHASE 4: FastAPI server for AttentionOS agent.
Provides HTTP endpoints to access agent data.
"""

import sqlite3
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Database path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "attentionos.db")

# Create FastAPI app
app = FastAPI(
    title="AttentionOS Agent API",
    description="Local HTTP interface for AttentionOS tracking agent",
    version="1.0.0"
)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "service": "AttentionOS Agent API",
        "version": "1.0.0",
        "endpoints": [
            "/api/agent/status",
            "/api/agent/focus-score"
        ]
    }


@app.get("/api/agent/status")
def get_agent_status():
    """
    Get latest 10 timeline entries.
    Returns activity log with timestamps, app names, idle status, and window metadata.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT timestamp, app_name, is_idle, window_title, bundle_id
            FROM timeline
            ORDER BY timestamp DESC
            LIMIT 10
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        timeline = []
        for row in rows:
            timeline.append({
                "timestamp": row["timestamp"],
                "app_name": row["app_name"],
                "is_idle": bool(row["is_idle"]),
                "window_title": row["window_title"] or "",
                "bundle_id": row["bundle_id"] or ""
            })
        
        return {
            "status": "success",
            "count": len(timeline),
            "timeline": timeline
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


@app.get("/api/agent/focus-score")
def get_focus_score():
    """
    Get focus score from the most recent session.
    Returns session statistics including focus score, active/idle time, and app switches.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT start_time, end_time, total_active_seconds, 
                   total_idle_seconds, app_switches, focus_score
            FROM sessions
            ORDER BY end_time DESC
            LIMIT 1
        ''')
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "status": "success",
                "session": {
                    "start_time": row["start_time"],
                    "end_time": row["end_time"],
                    "total_active_seconds": row["total_active_seconds"],
                    "total_idle_seconds": row["total_idle_seconds"],
                    "app_switches": row["app_switches"],
                    "focus_score": round(row["focus_score"], 2)
                }
            }
        else:
            return {
                "status": "success",
                "session": None,
                "message": "No completed sessions found"
            }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


if __name__ == "__main__":
    import uvicorn
    print("Starting AttentionOS Agent API on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
