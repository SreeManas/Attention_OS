# AttentionOS

A minimal, macOS-native productivity tracking application with local agent, REST API backend, and beautiful dashboard.

## 🧠 Overview

AttentionOS tracks your application usage, idle time, and focus patterns to help you understand your productivity. Built with Python (agent + API) and React (dashboard).

## ✨ Features

- **Local Agent** - Tracks active app and idle time on macOS
- **Session Analytics** - Focus score, active/idle time, app switches
- **REST API** - FastAPI backend serving SQLite data
- **Premium Dashboard** - Minimal Apple/Notion-inspired UI
- **Dark Mode** - System-wide theme toggle
- **Charts & Insights** - Visual analytics with Recharts

## 🚀 Quick Start

### 1. Install Dependencies

**Agent:**
```bash
pip install -r requirements.txt
```

**Backend:**
```bash
cd backend
pip install fastapi uvicorn
```

**Dashboard:**
```bash
cd dashboard
npm install
```

### 2. Run the Agent

```bash
python main.py
```

The agent will track your activity and store data in `data/attentionos.db`.

### 3. Start the Backend

```bash
cd backend
python main.py
```

API runs at `http://localhost:8000`

### 4. Launch the Dashboard

```bash
cd dashboard
npm run dev
```

Dashboard runs at `http://localhost:5173`

## 📊 Tech Stack

**Agent:**
- Python 3.x
- PyObjC (macOS integration)
- pynput (idle detection)
- SQLite

**Backend:**
- FastAPI
- SQLite
- Uvicorn

**Dashboard:**
- React 18
- Vite
- React Router
- Recharts
- CSS Variables (theming)

## 📁 Project Structure

```
miniproject/
├── main.py              # macOS tracking agent
├── backend/
│   └── main.py         # FastAPI backend
├── dashboard/          # React dashboard
│   └── src/
│       ├── pages/      # Dashboard, Timeline, Sessions, Analytics, Settings
│       ├── components/ # Reusable UI components
│       ├── context/    # Theme context
│       └── utils/      # API & helper functions
└── data/
    └── attentionos.db  # SQLite database
```

## 🎨 Design

Minimal Apple/Notion aesthetic with:
- Top navigation (no sidebar)
- Centered content (1200px max-width)
- Single indigo accent color
- SF Pro-inspired typography
- Subtle shadows and borders
- Generous whitespace

## 📝 Database Schema

**activity_logs** - App usage sessions  
**app_switches** - Application transitions  
**sessions** - Session summaries with focus scores

## 🔒 Privacy

All data stays local on your machine. No cloud, no tracking, no external services.

## 📄 License

MIT

---

Built as a mini-project showcasing full-stack development with Python and React.
