# 🧠 AttentionOS

> **Your Personal Focus Command Center** — A Beautiful, AI-Powered Productivity Tracker

AttentionOS is a **premium macOS productivity tracker** with a stunning holographic interface and AI-powered insights that transforms raw activity data into meaningful focus patterns. Built with a local-first philosophy: your data never leaves your machine.

---

## ✨ Key Features

### 🤖 **AI Focus Coach** — Gemini-Powered Insights *(New!)*
Get intelligent, personalized productivity coaching powered by Google's Gemini AI:
- **Quick Tips:** Instant feedback on your current session
- **Deep Analysis:** 7-day comprehensive analysis with conversational follow-ups
- **Chat Interface:** Ask questions about your data and get context-aware responses
- **Persistent Conversations:** Chat history saved across sessions
- **Floating Bubble UI:** Beautiful, unobtrusive AI assistant in your dashboard

### 🎯 **Focus Pulse** — 3D Energy Core Visualization
A mesmerizing **3D holographic orb** that visualizes your current focus state in real-time. Inspired by Tony Stark's arc reactor, this animated energy core displays:
- Glowing center sphere with rotating energy rings
- Dynamic particle systems that react to focus quality
- Real-time health percentage and focus streak tracking
- Smooth animations powered by React Three Fiber

### 🧬 **FocusDNA Helix** — Genetic Visualization
A stunning **3D double-helix** representing your focus patterns over time:
- Color-coded base pairs show session quality (green = good, yellow = average, red = poor)
- Energy beams connect the DNA strands with volumetric lighting
- Post-processing effects: bloom, vignette, chromatic aberration
- Full orbital camera controls to explore your data

### � **4-Phase Activity Tracking Agent** *(New!)*
The macOS tracking agent has been upgraded to a comprehensive monitoring system:

**PHASE 1: Core Tracking**
- Session management with start/end times and durations
- Idle detection when no input for >60 seconds
- App switch frequency monitoring
- Focus score calculation

**PHASE 2: Timeline Logging**
- Automated logging every 30 seconds
- Granular activity tracking for detailed analysis
- Captures app state and idle status continuously

**PHASE 3: Window Metadata Capture**
- Window titles extracted via macOS Quartz APIs
- Bundle identifiers for precise app identification
- Rich context for every activity session

**PHASE 4: HTTP API Interface**
- FastAPI server on port 8001
- RESTful endpoints for external access
- Real-time data synchronization
- Concurrent execution with tracking agent

### �📊 **Session Analytics**
- Detailed session history with focus scores
- Active time vs. idle time breakdown
- App switch frequency analysis
- Timeline view of all activities
- Window-level activity tracking

### 🎲 **DEV/DEMO Mode**
Perfect for testing and demonstrations:
- Generates **20-50 realistic focus sessions** spanning 7 days
- Mix of productive apps (VSCode, Figma, Notion) and distractions (WhatsApp, YouTube)
- Varied session quality: good (80-95%), average (60-79%), bad (40-59%)
- Full timeline events and app switch tracking
- One-click regeneration via Settings → Developer Tools

### 🎨 **Premium Design**
- **Minimal Apple/Notion aesthetic** with generous whitespace
- **Dark mode** with smooth theme transitions
- **Premium glassmorphism** effects throughout
- **Micro-animations** for enhanced UX
- **Responsive design** that scales beautifully

---

## 🚀 Quick Start

### Prerequisites
- **macOS** (for the tracking agent)
- **Python 3.8+**
- **Node.js 16+** and npm
- **Gemini API Key** (for AI features)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SreeManas/Attention_OS.git
cd Attention_OS
```

### 2️⃣ Install Dependencies

**Agent** (macOS activity tracker with API):
```bash
pip install -r requirements.txt
```

**Backend** (FastAPI server):
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env
cd ..
```

**Dashboard** (React frontend):
```bash
cd dashboard
npm install
cd ..
```

### 3️⃣ Start Everything

**Terminal 1 — Run the 4-Phase Tracking Agent:**
```bash
python main.py
```
This starts:
- Activity tracking (app usage, idle detection, window metadata)
- Timeline logging (every 30 seconds)
- HTTP API server (http://localhost:8001)

Data stored in `data/attentionos.db`.

**Terminal 2 — Start the Backend API:**
```bash
cd backend
uvicorn main:app --reload
```
Backend API runs at `http://localhost:8000` with:
- Session and timeline endpoints
- AI chat endpoints (Gemini integration)
- Auto-docs at `/docs`

**Terminal 3 — Launch the Dashboard:**
```bash
cd dashboard
npm run dev
```
Dashboard runs at `http://localhost:5173` — open this in your browser!

---

## 🤖 Using the AI Coach

### Getting Started with AI Features

1. **Get a Gemini API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create a free API key
   - Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`

2. **Access the AI Coach:**
   - Look for the floating purple brain 🧠 bubble in the bottom-right of your dashboard
   - Click to expand and choose:
     - **Quick Tips**: Instant feedback on your current session
     - **Deep Analysis**: 7-day comprehensive analysis with chat

3. **Chat with Your Data:**
   - Ask questions like:
     - "How can I improve my focus?"
     - "What apps distract me the most?"
     - "When am I most productive?"
   - Get personalized, context-aware responses
   - Your conversation persists when you close the window

4. **Restart Analysis:**
   - Click the 🔄 Restart button to clear chat and get fresh analysis
   - Analyzes your latest 7 sessions

---

## 🎮 Try Demo Mode

Don't want to wait for real data? Use **Demo Mode**:

1. Open the dashboard: `http://localhost:5173`
2. Navigate to **Settings** (top nav)
3. Scroll to **🛠 Developer Tools**
4. Click **🎲 Generate Data**
5. Watch as 25-45 sessions with realistic activity patterns populate instantly!

Now explore:
- **Dashboard** — See your Focus Pulse energy core glowing
- **Analytics** — Watch the DNA helix rotate with session data
- **Sessions** — Browse through generated sessions
- **Timeline** — View detailed activity logs
- **AI Coach** — Get AI insights on demo data

---

## 📁 Project Structure

```
Attention_OS/
│
├── main.py                    # 🎯 4-Phase macOS tracking agent
├── api.py                     # 🔌 Agent HTTP API (port 8001)
├── test_agent.sh             # 🧪 Agent verification script
│
├── backend/
│   ├── main.py               # 🚀 FastAPI backend with AI endpoints
│   └── .env                  # 🔑 Gemini API key (create this)
│
├── dashboard/                # ⚛️ React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard with FocusPulse
│   │   │   ├── Analytics.jsx       # DNA helix visualization
│   │   │   ├── Sessions.jsx        # Session list
│   │   │   ├── Timeline.jsx        # Activity timeline
│   │   │   └── Settings.jsx        # Settings + Demo mode
│   │   │
│   │   ├── components/
│   │   │   ├── AIBubble.jsx        # AI chat bubble interface
│   │   │   ├── FocusPulse.jsx      # Energy core container
│   │   │   ├── FocusCore.jsx       # 3D orb visualization (R3F)
│   │   │   ├── FocusDNA3D.jsx      # DNA helix (R3F)
│   │   │   ├── SessionWrap.jsx     # Session summary modal
│   │   │   └── [others...]
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx    # Dark/light mode
│   │   │
│   │   └── utils/
│   │       ├── api.js              # API wrapper
│   │       └── achievements.js      # Achievement system
│   │
│   └── index.css                   # Global styles with CSS variables
│
└── data/
    └── attentionos.db              # 💾 SQLite database (auto-created)
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Agent** | Python 3, PyObjC (macOS APIs), Quartz (window metadata), pynput (idle detection), FastAPI, SQLite |
| **Backend** | FastAPI, Uvicorn, SQLite3, Google Gemini AI SDK |
| **Frontend** | React 18, Vite, React Router, Framer Motion |
| **3D Graphics** | React Three Fiber (@react-three/fiber), Three.js, @react-three/drei, @react-three/postprocessing |
| **Charts** | Recharts |
| **Styling** | CSS Variables, Custom CSS (no Tailwind) |

---

## 📊 Database Schema

### `sessions`
Session summaries with aggregated metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `start_time` | TEXT | ISO 8601 timestamp |
| `end_time` | TEXT | ISO 8601 timestamp |
| `total_active_seconds` | INTEGER | Time actively working |
| `total_idle_seconds` | INTEGER | Time idle |
| `app_switches` | INTEGER | Number of app changes |
| `focus_score` | REAL | 0-100 focus quality score |

### `activity_logs`
Individual app usage events with window metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `app_name` | TEXT | Application name |
| `start_time` | TEXT | ISO 8601 timestamp |
| `end_time` | TEXT | ISO 8601 timestamp |
| `duration_seconds` | INTEGER | Event duration |
| `window_title` | TEXT | Active window title |
| `bundle_id` | TEXT | App bundle identifier |

### `timeline`
30-second interval activity snapshots.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `timestamp` | TEXT | ISO 8601 timestamp |
| `app_name` | TEXT | Application name |
| `is_idle` | INTEGER | 1 if idle, 0 if active |
| `window_title` | TEXT | Active window title |
| `bundle_id` | TEXT | App bundle identifier |

### `app_switches`
Application switch events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `from_app` | TEXT | Previous app |
| `to_app` | TEXT | New app |
| `timestamp` | TEXT | ISO 8601 timestamp |

---

## 🔌 API Endpoints

### Agent API (Port 8001)
Base URL: `http://localhost:8001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service info |
| `GET` | `/api/agent/status` | Latest 10 timeline entries |
| `GET` | `/api/agent/focus-score` | Most recent session stats |

### Backend API (Port 8000)
Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/sessions` | Get all sessions |
| `GET` | `/api/timeline` | Get all activity logs |
| `GET` | `/api/app-switches` | Get app switch events |
| `POST` | `/api/ai/explain` | Get AI tips for session |
| `POST` | `/api/ai/deep-analysis` | Get 7-day AI analysis |
| `POST` | `/api/ai/chat` | Chat with AI about your data |
| `POST` | `/api/dev/generate-demo-data` | Generate demo sessions |

**Docs:** 
- Agent API: `http://localhost:8001` (root endpoint)
- Backend API: `http://localhost:8000/docs` (auto-generated)

---

## 🤖 AI Features

### Gemini Integration

AttentionOS uses Google's Gemini AI for intelligent productivity insights:

**Models Used:**
- `gemini-2.5-flash` - Fast, efficient responses for chat and analysis
- `gemini-2.5-pro` - Deep analysis (when quota available)

**API Endpoints:**

**Quick Tips** (`POST /api/ai/explain`)
```json
{
  "focus_score": 75,
  "duration_minutes": 45,
  "active_time_minutes": 38,
  "idle_time_minutes": 7,
  "app_switches": 15,
  "top_apps": ["VSCode", "Chrome"],
  "session_date": "2026-02-01"
}
```

**Deep Analysis** (`POST /api/ai/deep-analysis`)
- Analyzes last 7 sessions
- Aggregates metrics and patterns
- Provides comprehensive insights

**Chat** (`POST /api/ai/chat`)
```json
{
  "context": "Previous analysis context...",
  "messages": [
    {"role": "user", "content": "How can I improve?"},
    {"role": "assistant", "content": "Based on your data..."}
  ]
}
```

---

## 🔒 Privacy First

**Your data stays on your machine. Period.**

- ✅ **100% local** — Database stored in `data/attentionos.db`
- ✅ **No tracking** — No analytics, no telemetry
- ✅ **No ads** — Clean, ad-free experience
- ✅ **Open source** — Audit the code yourself
- ⚠️ **AI features** — Gemini API processes data in cloud (optional feature)
  - Only activated when you click AI buttons
  - Data sent: session metrics, not raw window titles
  - No persistent storage on Google's servers

---

## 🎯 Focus Score Algorithm

The **focus score** (0-100) is calculated based on:

1. **Active Time Ratio** (50% weight)
   - Higher active time = higher score
   
2. **App Switch Frequency** (30% weight)
   - Fewer switches = better focus
   
3. **Session Duration** (20% weight)
   - Longer sessions = sustained focus

**Categories:**
- 🟢 **Thriving** (85-100): Peak focus state
- 🟡 **Focused** (70-84): Good concentration
- 🟠 **Distracted** (55-69): Some interruptions
- 🔴 **Struggling** (0-54): High distraction

---

## 🧪 Testing the Agent

Run the automated verification script:

```bash
chmod +x test_agent.sh
./test_agent.sh
```

This tests:
- Database schema creation
- Timeline logging
- Window metadata capture
- API endpoints functionality

---

## 🚧 Roadmap

### Implemented ✅
- [x] **AI Focus Coach** — Gemini-powered insights and chat
- [x] **4-Phase Tracking** — Timeline, metadata, and API
- [x] **Chat Persistence** — Saved conversations
- [x] **3D Visualizations** — FocusPulse and DNA Helix
- [x] **Demo Mode** — Realistic test data generation

### Coming Soon 🚀
- [ ] **Weekly/Monthly Reports** — Trend analysis over time
- [ ] **Smart Notifications** — Gentle focus reminders
- [ ] **Goal Setting** — Daily focus targets
- [ ] **Export Data** — CSV/JSON export
- [ ] **Custom App Categories** — Label apps as productive/neutral/distracting
- [ ] **Pomodoro Timer** — Built-in focus sessions
- [ ] **Cross-platform** — Windows & Linux support

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Submit feature requests
- Open pull requests

---

## 📄 License

**MIT License** — Free to use, modify, and distribute.

---

## 🙏 Acknowledgments

Built with love using:
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for intelligent insights
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for 3D magic
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [FastAPI](https://fastapi.tiangolo.com/) for blazing-fast APIs
- [Recharts](https://recharts.org/) for beautiful charts

---

**Made with 💜 by [SreeManas](https://github.com/SreeManas)**

*Transform your productivity, one focus session at a time.* 🚀
