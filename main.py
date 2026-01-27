#!/usr/bin/env python3
"""
Minimal macOS active application tracker with idle detection.
Tracks app sessions with start_time, end_time, and duration.
Detects idle state when no keyboard/mouse input for > 60 seconds.
"""

import time
import sqlite3
import os
from datetime import datetime
from AppKit import NSWorkspace
from pynput import mouse, keyboard
from threading import Lock


# Database path configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "attentionos.db")

# Global variables for idle detection
last_activity_time = datetime.now()
activity_lock = Lock()
IDLE_THRESHOLD_SECONDS = 60


def on_activity():
    """Callback when keyboard or mouse activity is detected."""
    global last_activity_time
    with activity_lock:
        last_activity_time = datetime.now()


def start_input_listeners():
    """Start background listeners for keyboard and mouse activity."""
    # Mouse listener
    mouse_listener = mouse.Listener(
        on_move=lambda x, y: on_activity(),
        on_click=lambda x, y, button, pressed: on_activity(),
        on_scroll=lambda x, y, dx, dy: on_activity()
    )
    mouse_listener.daemon = True
    mouse_listener.start()
    
    # Keyboard listener
    keyboard_listener = keyboard.Listener(
        on_press=lambda key: on_activity()
    )
    keyboard_listener.daemon = True
    keyboard_listener.start()


def is_idle():
    """Check if user has been idle for more than IDLE_THRESHOLD_SECONDS."""
    with activity_lock:
        idle_duration = (datetime.now() - last_activity_time).total_seconds()
    return idle_duration > IDLE_THRESHOLD_SECONDS


def init_database():
    """Initialize SQLite database and create tables if needed."""
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
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
    
    conn.commit()
    conn.close()
    print(f"Database initialized: {DB_PATH}\n")


def start_new_session(app_name, start_time):
    """Insert a new activity session."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO activity_logs (app_name, start_time, end_time, duration_seconds)
        VALUES (?, ?, NULL, 0)
    ''', (app_name, start_time))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return record_id


def update_session(record_id, end_time, duration_seconds):
    """Update existing activity session with new end_time and duration."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE activity_logs
        SET end_time = ?, duration_seconds = ?
        WHERE id = ?
    ''', (end_time, duration_seconds, record_id))
    
    conn.commit()
    conn.close()


def log_app_switch(from_app, to_app, timestamp):
    """Log an application switch event."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO app_switches (from_app, to_app, timestamp)
        VALUES (?, ?, ?)
    ''', (from_app, to_app, timestamp))
    
    conn.commit()
    conn.close()


def get_active_app():
    """Get the name of the currently active application."""
    workspace = NSWorkspace.sharedWorkspace()
    active_app = workspace.activeApplication()
    return active_app['NSApplicationName']


def save_session_summary(session_start, session_end):
    """Compute and save session summary statistics."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get total active time (all apps except IDLE)
    cursor.execute('''
        SELECT COALESCE(SUM(duration_seconds), 0)
        FROM activity_logs
        WHERE app_name != 'IDLE'
        AND start_time >= ?
    ''', (session_start,))
    total_active_seconds = cursor.fetchone()[0]
    
    # Get total idle time
    cursor.execute('''
        SELECT COALESCE(SUM(duration_seconds), 0)
        FROM activity_logs
        WHERE app_name = 'IDLE'
        AND start_time >= ?
    ''', (session_start,))
    total_idle_seconds = cursor.fetchone()[0]
    
    # Get app switch count
    cursor.execute('''
        SELECT COUNT(*)
        FROM app_switches
        WHERE timestamp >= ?
    ''', (session_start,))
    app_switches_count = cursor.fetchone()[0]
    
    # Calculate focus score
    total_time = total_active_seconds + total_idle_seconds
    if total_time > 0:
        focus_score = (total_active_seconds / total_time) * 100
    else:
        focus_score = 0.0
    
    # Insert session summary
    cursor.execute('''
        INSERT INTO sessions (start_time, end_time, total_active_seconds, 
                             total_idle_seconds, app_switches, focus_score)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (session_start, session_end, total_active_seconds, 
          total_idle_seconds, app_switches_count, focus_score))
    
    conn.commit()
    conn.close()
    
    return {
        'active': total_active_seconds,
        'idle': total_idle_seconds,
        'switches': app_switches_count,
        'focus_score': focus_score
    }


def main():
    """Main loop that tracks app sessions and idle state."""
    init_database()
    
    # Start input listeners for idle detection
    start_input_listeners()
    print("Idle detection enabled (60s threshold)")
    
    print("Starting active application tracker...")
    print("Press Ctrl+C to stop.\n")
    
    # Record session start time
    program_start_time = datetime.now()
    program_start_str = program_start_time.strftime("%Y-%m-%d %H:%M:%S")
    
    current_record_id = None
    last_app = None
    session_start_time = None
    
    try:
        while True:
            current_time = datetime.now()
            timestamp_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Determine current state (idle or active app)
            if is_idle():
                current_state = "IDLE"
            else:
                current_state = get_active_app()
            
            if current_state != last_app:
                # State changed - close previous session and start new one
                if current_record_id is not None:
                    # Close the previous session
                    duration = int((current_time - session_start_time).total_seconds())
                    update_session(current_record_id, timestamp_str, duration)
                    print(f"[{timestamp_str}] Closed: {last_app} ({duration}s)")
                
                # Log the app switch
                log_app_switch(last_app, current_state, timestamp_str)
                
                # Start new session
                session_start_time = current_time
                current_record_id = start_new_session(current_state, timestamp_str)
                last_app = current_state
                
                if current_state == "IDLE":
                    print(f"[{timestamp_str}] Started: IDLE (user inactive)")
                else:
                    print(f"[{timestamp_str}] Started: {current_state}")
            else:
                # Same state - update duration
                duration = int((current_time - session_start_time).total_seconds())
                update_session(current_record_id, timestamp_str, duration)
                
                if current_state == "IDLE":
                    print(f"[{timestamp_str}] Idle: {duration}s")
                else:
                    print(f"[{timestamp_str}] Active: {current_state} ({duration}s)")
            
            time.sleep(5)
    
    except KeyboardInterrupt:
        # Gracefully close the last session
        if current_record_id is not None:
            current_time = datetime.now()
            timestamp_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
            duration = int((current_time - session_start_time).total_seconds())
            update_session(current_record_id, timestamp_str, duration)
            print(f"\n[{timestamp_str}] Closed: {last_app} ({duration}s)")
        
        # Save session summary
        program_end_time = datetime.now()
        program_end_str = program_end_time.strftime("%Y-%m-%d %H:%M:%S")
        
        print("\nComputing session summary...")
        stats = save_session_summary(program_start_str, program_end_str)
        
        print(f"Session Summary:")
        print(f"  Active time: {stats['active']}s")
        print(f"  Idle time: {stats['idle']}s")
        print(f"  App switches: {stats['switches']}")
        print(f"  Focus score: {stats['focus_score']:.2f}%")
        
        print("\nStopping tracker. Goodbye!")


if __name__ == "__main__":
    main()
