#!/usr/bin/env python3
"""
Minimal FastAPI backend for AttentionOS.
Serves data from SQLite database via REST API.
Includes Gemini AI coaching integration using official SDK.
"""

import sqlite3
import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

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

# ============================================
# GEMINI AI COACH CONFIGURATION
# ============================================

# Get API key from environment variable and configure SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-2.5-flash for fast responses (2.5-pro quota exhausted on free tier)
    GEMINI_MODEL = genai.GenerativeModel('gemini-2.5-flash')
else:
    GEMINI_MODEL = None

# Pydantic model for session data input
class SessionData(BaseModel):
    """Model for session data sent to AI coach."""
    id: Optional[int] = None
    focus_score: float
    duration_minutes: float
    active_time_minutes: float
    idle_time_minutes: float
    app_switches: int
    top_apps: Optional[List[str]] = []
    session_date: Optional[str] = None

# Fallback AI response for demos/errors
FALLBACK_AI_RESPONSE = """
🎯 **Great session overall!** Here's my analysis:

**What went well:**
- You maintained solid focus throughout the session
- Good balance between deep work and short breaks
- App switching was within healthy limits

**Areas to improve:**
- Consider using time-blocking for your most demanding tasks
- Try the Pomodoro technique (25 min focus + 5 min break) for better sustained attention
- Minimize browser tabs to reduce distractions

**Pro tip:** Your brain needs variety! Alternate between creative and analytical tasks to maintain peak performance.

Keep up the great work! 🚀
"""


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


# ============================================
# GEMINI AI COACH ENDPOINT
# ============================================

@app.post("/api/ai/explain")
async def get_ai_explanation(session: SessionData):
    """
    Get AI-powered coaching and insights for a focus session.
    Uses Gemini Pro API with fallback for demos/errors.
    """
    
    # Build the prompt with session data
    prompt = f"""You are an AI productivity coach named Focus Coach. Based on the following focus session data, provide clear, helpful feedback. Be encouraging but honest. Use emojis sparingly.

SESSION DATA:
- Focus Score: {session.focus_score:.1f}%
- Duration: {session.duration_minutes:.0f} minutes
- Active Time: {session.active_time_minutes:.0f} minutes  
- Idle Time: {session.idle_time_minutes:.0f} minutes
- App Switches: {session.app_switches}
- Top Apps Used: {', '.join(session.top_apps) if session.top_apps else 'N/A'}
- Session Date: {session.session_date or 'Today'}

Analyze this session and respond with:
1. A brief summary (1-2 sentences) of how the session went
2. What went well (2-3 bullet points)
3. Areas for improvement (2-3 bullet points)
4. One actionable tip for the next session

Keep your response concise and under 200 words. Use markdown formatting."""

    # Check if API key is configured
    if not GEMINI_API_KEY:
        print("⚠️ GEMINI_API_KEY not set, using fallback response")
        return {
            "status": "fallback",
            "message": "AI coaching running in demo mode (API key not configured)",
            "response": FALLBACK_AI_RESPONSE,
            "is_cached": True
        }
    
    try:
        # Call Gemini API using official SDK
        response = GEMINI_MODEL.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2000,
                top_p=0.9
            )
        )
        
        # Extract text from response
        if response and response.text:
            return {
                "status": "success",
                "message": "AI analysis complete",
                "response": response.text,
                "is_cached": False
            }
        else:
            # Empty response, use fallback
            return {
                "status": "fallback",
                "message": "AI returned empty response, using cached insights",
                "response": FALLBACK_AI_RESPONSE,
                "is_cached": True
            }
            
    except Exception as e:
        print(f"⚠️ Gemini API exception: {str(e)}")
        return {
            "status": "fallback",
            "message": f"AI service error: {str(e)}",
            "response": FALLBACK_AI_RESPONSE,
            "is_cached": True
        }


# Fallback for deep analysis
FALLBACK_DEEP_ANALYSIS = """
# 📊 7-Day Productivity Analysis

## Overview
Based on your recent focus sessions, here's an in-depth analysis of your productivity patterns.

## 📈 Trends Observed
- **Focus Score Trend**: Your focus scores show consistent performance
- **Session Duration**: You're maintaining good session lengths
- **Peak Productivity Hours**: Mid-morning tends to be your most productive time

## 🎯 Key Insights
- **Strength**: You show good commitment to focused work sessions
- **Opportunity**: Consider reducing app switching during deep work periods
- **Pattern**: Your best sessions occur when working on coding tasks

## 💡 Recommendations
1. **Time Blocking**: Schedule your most demanding tasks during your peak hours
2. **App Discipline**: Use focus mode to block distracting apps during deep work
3. **Regular Breaks**: Maintain the Pomodoro technique for sustained productivity
4. **Session Goals**: Set a specific goal before each focus session

## 🏆 Summary
You're building strong productivity habits! Keep tracking your sessions to identify more patterns and optimize your workflow.
"""


@app.post("/api/ai/deep-analysis")
async def get_deep_analysis():
    """Get in-depth AI analysis of the last 7 sessions using Gemini 2.5 Pro."""
    
    # Fetch last 7 sessions from database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get last 7 sessions
        cursor.execute('''
            SELECT id, start_time, end_time, total_active_seconds, 
                   total_idle_seconds, app_switches, focus_score
            FROM sessions
            ORDER BY start_time DESC
            LIMIT 7
        ''')
        sessions = rows_to_dict(cursor.fetchall())
        
        if not sessions:
            conn.close()
            return {
                "status": "fallback",
                "message": "No sessions found. Generate demo data first.",
                "response": FALLBACK_DEEP_ANALYSIS,
                "is_cached": True,
                "sessions_analyzed": 0
            }
        
        # Get top apps by total usage
        cursor.execute('''
            SELECT app_name, SUM(duration_seconds) as total_seconds
            FROM activity_logs
            GROUP BY app_name
            ORDER BY total_seconds DESC
            LIMIT 10
        ''')
        top_apps = rows_to_dict(cursor.fetchall())
        
        # Get recent app switches for pattern analysis
        cursor.execute('''
            SELECT from_app, to_app, COUNT(*) as switch_count
            FROM app_switches
            WHERE from_app IS NOT NULL
            GROUP BY from_app, to_app
            ORDER BY switch_count DESC
            LIMIT 10
        ''')
        switch_patterns = rows_to_dict(cursor.fetchall())
        
        conn.close()
        
    except Exception as e:
        print(f"⚠️ Database error in deep analysis: {str(e)}")
        return {
            "status": "error",
            "message": f"Database error: {str(e)}",
            "response": FALLBACK_DEEP_ANALYSIS,
            "is_cached": True,
            "sessions_analyzed": 0
        }
    
    # Calculate aggregated statistics
    total_sessions = len(sessions)
    avg_focus_score = sum(s['focus_score'] for s in sessions) / total_sessions
    total_active_mins = sum(s['total_active_seconds'] for s in sessions) / 60
    total_idle_mins = sum(s['total_idle_seconds'] for s in sessions) / 60
    total_switches = sum(s['app_switches'] for s in sessions)
    
    # Find best and worst sessions
    best_session = max(sessions, key=lambda s: s['focus_score'])
    worst_session = min(sessions, key=lambda s: s['focus_score'])
    
    # Format session summaries
    session_summaries = []
    for i, s in enumerate(sessions):
        duration_mins = (s['total_active_seconds'] + s['total_idle_seconds']) / 60
        session_summaries.append(
            f"  {i+1}. {s['start_time'][:10]} - Focus: {s['focus_score']:.1f}%, Duration: {duration_mins:.0f}min, Switches: {s['app_switches']}"
        )
    
    # Format top apps
    top_apps_str = ", ".join([f"{a['app_name']} ({a['total_seconds']//60}min)" for a in top_apps[:5]])
    
    # Format switch patterns
    switch_str = ", ".join([f"{p['from_app']}→{p['to_app']} ({p['switch_count']}x)" for p in switch_patterns[:5]])
    
    # Build comprehensive prompt
    prompt = f"""You are Focus Coach, an expert AI productivity analyst. Analyze the following 7-day productivity data and provide a comprehensive, actionable analysis.

## AGGREGATED STATS (Last {total_sessions} Sessions):
- Average Focus Score: {avg_focus_score:.1f}%
- Total Active Time: {total_active_mins:.0f} minutes
- Total Idle Time: {total_idle_mins:.0f} minutes
- Total App Switches: {total_switches}
- Best Session: {best_session['focus_score']:.1f}% focus on {best_session['start_time'][:10]}
- Worst Session: {worst_session['focus_score']:.1f}% focus on {worst_session['start_time'][:10]}

## INDIVIDUAL SESSIONS:
{chr(10).join(session_summaries)}

## TOP APPS BY USAGE:
{top_apps_str}

## COMMON APP SWITCH PATTERNS:
{switch_str if switch_str else "No patterns detected"}

---

Provide a detailed analysis with the following sections (use markdown formatting):

# 📊 7-Day Productivity Analysis

## Overview
Brief summary of overall productivity (2-3 sentences).

## 📈 Trends Observed
Analyze patterns in the data (focus score trends, timing patterns, etc.)

## 🎯 Key Insights
- What's working well
- What needs improvement
- Notable patterns in app usage and switching

## 💡 Personalized Recommendations
3-4 specific, actionable recommendations based on the data.

## 🏆 Summary
Encouraging closing statement with a key metric to focus on improving.

Keep your response comprehensive but under 400 words. Be specific and reference actual data from the sessions."""

    # Check if API key is configured
    if not GEMINI_API_KEY or not GEMINI_MODEL:
        print("⚠️ GEMINI_API_KEY not set, using fallback response")
        return {
            "status": "fallback",
            "message": "AI coaching running in demo mode (API key not configured)",
            "response": FALLBACK_DEEP_ANALYSIS,
            "is_cached": True,
            "sessions_analyzed": total_sessions
        }
    
    try:
        # Call Gemini 2.5 Pro for deep analysis
        response = GEMINI_MODEL.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=4000,  # More tokens for detailed analysis
                top_p=0.9
            )
        )
        
        if response and response.text:
            return {
                "status": "success",
                "message": "Deep analysis complete",
                "response": response.text,
                "is_cached": False,
                "sessions_analyzed": total_sessions
            }
        else:
            return {
                "status": "fallback",
                "message": "AI returned empty response, using cached insights",
                "response": FALLBACK_DEEP_ANALYSIS,
                "is_cached": True,
                "sessions_analyzed": total_sessions
            }
            
    except Exception as e:
        print(f"⚠️ Gemini API exception in deep analysis: {str(e)}")
        return {
            "status": "fallback",
            "message": f"AI service error: {str(e)}",
            "response": FALLBACK_DEEP_ANALYSIS,
            "is_cached": True,
            "sessions_analyzed": total_sessions
        }


# Pydantic model for chat messages
class ChatMessage(BaseModel):
    """Model for a single chat message."""
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    """Model for chat request."""
    context: str  # The initial analysis context
    messages: List[ChatMessage]  # Conversation history


@app.post("/api/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI based on previous analysis context."""
    
    # Check if API key is configured
    if not GEMINI_API_KEY or not GEMINI_MODEL:
        return {
            "status": "error",
            "message": "AI service not configured",
            "response": "I'm currently in demo mode. Please configure the API key to enable chat."
        }
    
    # Build the system context from the analysis
    system_prompt = f"""You are Focus Coach, a helpful AI productivity assistant. 
You are having a conversation with a user about their productivity data and focus patterns.

Here is the context from their recent productivity analysis:
---
{request.context}
---

Based on this context, answer the user's questions helpfully and specifically. 
Reference their actual data when possible. Be encouraging but honest.
Keep responses concise (under 150 words) unless asked for more detail.
Use markdown formatting for clarity."""

    # Build the conversation history for Gemini
    conversation_parts = [system_prompt]
    
    for msg in request.messages:
        if msg.role == "user":
            conversation_parts.append(f"\nUser: {msg.content}")
        else:
            conversation_parts.append(f"\nAssistant: {msg.content}")
    
    # Add final prompt indicator
    full_prompt = "\n".join(conversation_parts) + "\n\nAssistant:"

    try:
        response = GEMINI_MODEL.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
                top_p=0.9
            )
        )
        
        if response and response.text:
            return {
                "status": "success",
                "message": "Chat response generated",
                "response": response.text
            }
        else:
            return {
                "status": "error",
                "message": "Empty response from AI",
                "response": "I couldn't generate a response. Please try rephrasing your question."
            }
            
    except Exception as e:
        print(f"⚠️ Chat API exception: {str(e)}")
        return {
            "status": "error",
            "message": f"AI service error: {str(e)}",
            "response": "I'm having trouble responding right now. Please try again in a moment."
        }


if __name__ == "__main__":
    import uvicorn
    print(f"Database path: {DB_PATH}")
    print("Starting FastAPI server at http://localhost:8000")
    print("API docs available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)

